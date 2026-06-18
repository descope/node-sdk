import { fetch as crossFetch, Headers } from 'cross-fetch';

globalThis.Headers ??= Headers;

const highWaterMarkMb = 1024 * 1024 * 30; // 30MB

// we are increasing the response buffer size due to an issue where node-fetch hangs when response is too big
const patchedFetch = (...args: Parameters<typeof crossFetch>) => {
  // we can get Request on the first arg, or RequestInfo on the second arg
  // we want to make sure we are setting the "highWaterMark" so we are doing it on both args
  args.forEach((arg) => {
    // Updated to only apply highWaterMark to objects, as it can't be applied to strings (it breaks it)
    if (arg && typeof arg === 'object') {
      // eslint-disable-next-line no-param-reassign, @typescript-eslint/no-unused-expressions
      (arg as any).highWaterMark ??= highWaterMarkMb;
    }
  });

  return crossFetch(...args);
};

// node-fetch@2 (bundled by cross-fetch) throws a false ERR_STREAM_PREMATURE_CLOSE on
// keep-alive responses on Node >= 22.23.0 / 24.17.0 (nodejs/node#63989, the CVE-2026-48931
// http.Agent fix). Node's built-in fetch (undici, Node >= 18) is unaffected, so prefer it
// when present and fall back to cross-fetch (node-fetch) only on older runtimes.
const polyfillFetch =
  typeof globalThis.fetch === 'function'
    ? (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args)
    : patchedFetch;

export default polyfillFetch as unknown as typeof fetch;
