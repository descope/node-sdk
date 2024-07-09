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

export default patchedFetch as unknown as typeof fetch;
