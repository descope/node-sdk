// Requests without a caller-provided signal that get no response within this time are aborted
const DEFAULT_TIMEOUT_MS = 30000;

/** Abort the request after DEFAULT_TIMEOUT_MS unless the caller manages its own signal */
const withTimeout =
  (fetchFn: typeof globalThis.fetch) =>
  (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: Parameters<typeof globalThis.fetch>[1],
  ) => {
    if (init?.signal) return fetchFn(input, init);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    return fetchFn(input, { ...init, signal: controller.signal })
      .catch((error) => {
        if (error?.name === 'AbortError') throw new Error('Request timeout exceeded');
        throw error;
      })
      .finally(() => clearTimeout(timeoutId));
  };

// Native fetch only (Node >= 18, browsers, Cloudflare Workers and other edge runtimes).
// Bundling a Node-based polyfill (cross-fetch/node-fetch) pulls `http`/`https` into edge
// builds, where unenv stubs them with functions that throw on call.
// Bound through a wrapper so undici's fetch keeps its correct `this`.
const polyfillFetch = withTimeout((...args: Parameters<typeof globalThis.fetch>) =>
  globalThis.fetch(...args),
);

export default polyfillFetch as unknown as typeof fetch;
