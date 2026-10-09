// Thin JSON-RPC client for the b2b-cms backend (Arise). Every call is
// POST {API_BASE}/rpc with { method: "resource.action", params }, and the
// slikeauth login cookie is sent along (credentials: 'include').

// Same variable and hosts as slike-frontend: app-dev.sli.ke (dev), app.sli.ke (prod).
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

  // 409: someone else saved this graphic after we loaded it.
  get isConflict() { return this.code === 409; }
  get isUnauthorized() { return this.code === UNAUTHORIZED; }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function send(method, params) {
  const response = await fetch(API_BASE + RPC_PATH, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params }),
  });
  // Arise answers 200 with { result, error, code }; auth/gateway failures can
  // come back as a bare HTTP status with no JSON body.
  const body = await response.json().catch(() => ({}));
  return { code: body.code || response.status, error: body.error, result: body.result };
}

// Calls one RPC method and returns its `result`, or throws an RpcError.
export async function callRpc(method, params = {}) {
  for (let attempt = 0; ; attempt++) {
    const { code, error, result } = await send(method, params);
    if (code === 200) return result;
    if (!RETRYABLE_CODES.includes(code) || attempt >= MAX_RETRIES) {
      throw new RpcError(code === UNAUTHORIZED ? UNAUTHORIZED_MESSAGE : error, code);
    }
    await wait(RETRY_DELAY_MS * (attempt + 1));
  }
}
