import { fetch as crossFetch, Headers } from 'cross-fetch';

globalThis.Headers ??= Headers;

// node-fetch response buffer size, bounded to limit memory use on large responses
const highWaterMarkBytes = 1024 * 1024; // 1MB

// Requests that get no response within this time are aborted
const DEFAULT_TIMEOUT_MS = 30000;

const patchedFetch = (...args: Parameters<typeof crossFetch>) => {
  // we can get Request on the first arg, or RequestInfo on the second arg
  // we want to make sure we are setting the "highWaterMark" so we are doing it on both args
  args.forEach((arg) => {
    // Updated to only apply highWaterMark to objects, as it can't be applied to strings (it breaks it)
    if (arg && typeof arg === 'object') {
      // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unused-expressions
      (arg as any).highWaterMark ??= highWaterMarkBytes;
    }
  });

  return crossFetch(...args);
};

/** Abort the request after DEFAULT_TIMEOUT_MS, while still honoring a caller-provided signal */
const withTimeout =
  (fetchFn: typeof globalThis.fetch) =>
  (
    input: Parameters<typeof globalThis.fetch>[0],
    init?: Parameters<typeof globalThis.fetch>[1],
  ) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const userSignal = init?.signal;
    if (userSignal?.aborted) controller.abort();
    else userSignal?.addEventListener('abort', () => controller.abort(), { once: true });

    return fetchFn(input, { ...init, signal: controller.signal })
      .catch((error) => {
        if (error?.name === 'AbortError' && !userSignal?.aborted) {
          throw new Error('Request timeout exceeded');
        }
        throw error;
      })
      .finally(() => clearTimeout(timeoutId));
  };

// node-fetch@2 (bundled by cross-fetch) throws a false ERR_STREAM_PREMATURE_CLOSE on
// keep-alive responses on Node >= 22.23.0 / 24.17.0 (nodejs/node#63989, the CVE-2026-48931
// http.Agent fix). Node's built-in fetch (undici, Node >= 18) is unaffected, so prefer it
// when present and fall back to cross-fetch (node-fetch) only on older runtimes.
const polyfillFetch = withTimeout(
  typeof globalThis.fetch === 'function'
    ? (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args)
    : (patchedFetch as unknown as typeof globalThis.fetch), // cross-fetch types differ from the global fetch types
);

export default polyfillFetch as unknown as typeof fetch;
