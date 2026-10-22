#!/usr/bin/env node
// Runtime check for an on-air page: opens it in headless Chrome and samples, every few seconds,
// the JS heap, DOM nodes, CPU time spent on the page's main thread and style/layout work —
// then says whether memory kept growing.
//
//   node scripts/perf-check.mjs "<url>" [--minutes 2] [--every 10] [--chrome <path>] [--any-origin]
//
// Measure a production build: npm run build, then npx vite preview --port 4173 (or the deployed
// page). The backend and the Cleo player accept only their own origins; --any-origin starts the
// test Chrome (a throwaway profile) with web security off so localhost can load real data —
// for measuring only. Headless Chrome has no GPU: CPU figures run higher than on a real screen.
// Compare runs with each other (before / after a change), not with a target taken elsewhere.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a, i) => !a.startsWith('--') && !['--minutes', '--every', '--chrome'].includes(args[i - 1]));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const minutes = Number(opt('minutes', 2));
const everySec = Number(opt('every', 10));
const chromePath = opt('chrome', process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : 'google-chrome');
if (!url) {
  console.error('Usage: node scripts/perf-check.mjs "<url>" [--minutes 2] [--every 10]');
  process.exit(1);
}

const PORT = 9333;
const profile = mkdtempSync(path.join(tmpdir(), 'perf-check-'));
const chrome = spawn(chromePath, [
  '--headless=new', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, '--autoplay-policy=no-user-gesture-required', '--window-size=1280,720',
  '--ignore-certificate-errors', ...(args.includes('--any-origin') ? ['--disable-web-security'] : []), 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function devtools(pathname, method = 'GET') {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${pathname}`, { method });
      if (res.ok) return res.json();
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('Chrome did not start (check --chrome)');
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const waiting = new Map();
  const listeners = [];
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && waiting.has(msg.id)) {
      waiting.get(msg.id)(msg);
      waiting.delete(msg.id);
    } else listeners.forEach((fn) => fn(msg));
  };
  return new Promise((resolve) => {
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((done) => {
        id += 1;
        waiting.set(id, done);
        ws.send(JSON.stringify({ id, method, params }));
      }),
      on: (fn) => listeners.push(fn),
      close: () => ws.close(),
    });
  });
}

const mb = (bytes) => (bytes / 1048576).toFixed(1);
try {
  const target = await devtools(`/json/new?${encodeURIComponent(url)}`, 'PUT');
  const page = await connect(target.webSocketDebuggerUrl);
  const problems = [];
  page.on((msg) => {
    if (msg.method === 'Runtime.exceptionThrown') problems.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') problems.push(msg.params.entry.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') problems.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  });
  await page.send('Performance.enable', { timeDomain: 'timeTicks' });
  await page.send('Runtime.enable');
  await page.send('Log.enable');

  const read = async () => {
    const { result } = await page.send('Performance.getMetrics');
    return Object.fromEntries(result.metrics.map((m) => [m.name, m.value]));
  };
  console.log(`Page: ${url}\nSampling every ${everySec}s for ${minutes} min (first sample after 10s to let it load)\n`);
  await sleep(10000);
  const rows = [];
  let prev = await read();
  const end = Date.now() + minutes * 60000;
  while (Date.now() < end) {
    await sleep(everySec * 1000);
    const now = await read();
    const dt = now.Timestamp - prev.Timestamp;
    rows.push({
      'time (s)': Math.round((rows.length + 1) * everySec + 10),
      'JS heap (MB)': mb(now.JSHeapUsedSize),
      'DOM nodes': now.Nodes,
      'CPU (%)': ((100 * (now.TaskDuration - prev.TaskDuration)) / dt).toFixed(1),
      'style recalcs /s': ((now.RecalcStyleCount - prev.RecalcStyleCount) / dt).toFixed(1),
      'layouts /s': ((now.LayoutCount - prev.LayoutCount) / dt).toFixed(1),
    });
    prev = now;
  }
  console.table(rows);
  const first = Number(rows[0]['JS heap (MB)']);
  const last = Number(rows.at(-1)['JS heap (MB)']);
  const cpu = rows.reduce((sum, r) => sum + Number(r['CPU (%)']), 0) / rows.length;
  console.log(`JS heap ${first} → ${last} MB (${(((last - first) / first) * 100).toFixed(1)}%), DOM nodes ${rows[0]['DOM nodes']} → ${rows.at(-1)['DOM nodes']}, average CPU ${cpu.toFixed(1)}%`);
  if (problems.length) console.log(`\nErrors on the page (${problems.length}):\n- ${[...new Set(problems)].slice(0, 8).join('\n- ')}`);
  page.close();
} finally {
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true });
}
