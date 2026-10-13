const API_BASE = import.meta.env.VITE_API_BACKEND;
const RPC_PATH = '/rpc';
const RETRYABLE_CODES = [503, 504]; // backend busy / gateway timeout
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;
const UNAUTHORIZED = 401;
const UNAUTHORIZED_MESSAGE = 'You are not logged in. Log in to Slike in this browser, then reload this page.';

let requestId = 0;

export class RpcError extends Error {
  constructor(message, code) {
    super(message || 'Request failed');
    this.name = 'RpcError';
    this.code = code;
  }
  get isConflict() { return this.code === 409; }
  get isUnauthorized() { return this.code === UNAUTHORIZED; }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isAbort = (err) => err?.name === 'AbortError';
const aborted = () => new DOMException('The request was cancelled', 'AbortError');

const UNREACHABLE = 0;
const unreachableMessage = () => `Can't reach the backend at ${new URL(API_BASE).host} — is it running?`;

async function send(method, params, signal) {
  let response;
  try {
    response = await fetch(API_BASE + RPC_PATH, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
      signal,
    });
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new RpcError(unreachableMessage(), UNREACHABLE);
  }
  const body = await response.json().catch(() => ({}));
  if (signal?.aborted) throw aborted();
  return { code: body.code || response.status, error: body.error, result: body.result };
}

export async function getPublic(path, { signal } = {}) {
  const response = await fetch(API_BASE + path, { signal });
  const body = await response.json().catch(() => ({}));
  if (signal?.aborted) throw aborted();
  if (!response.ok) throw new RpcError(body.msg || `HTTP ${response.status}`, response.status);
  return body.data;
}

export async function callRpc(method, params = {}, { signal } = {}) {
  for (let attempt = 0; ; attempt++) {
    const { code, error, result } = await send(method, params, signal);
    if (code === 200) return result;
    if (!RETRYABLE_CODES.includes(code) || attempt >= MAX_RETRIES) {
      throw new RpcError(code === UNAUTHORIZED ? UNAUTHORIZED_MESSAGE : error, code);
    }
    await wait(RETRY_DELAY_MS * (attempt + 1));
    if (signal?.aborted) throw aborted();
  }
}
