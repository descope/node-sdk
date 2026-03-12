import { fetch as crossFetch, Headers } from 'cross-fetch';

globalThis.Headers ??= Headers;

// Reduced from 30MB to 1MB to prevent memory exhaustion attacks
const highWaterMarkBytes = 1024 * 1024; // 1MB

// Default timeout of 30 seconds to prevent indefinite hangs and Slowloris-style DoS
const DEFAULT_TIMEOUT_MS = 30000;

// we explicitly set the response buffer highWaterMark (1MB) to avoid node-fetch hanging on large responses while still bounding memory usage
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

  // Create an AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // Add signal to fetch options if not already present
  const [input, init] = args;
  const fetchInit = (init || {}) as RequestInit;

  // If a user-provided signal exists, propagate its abort to our controller
  const userSignal = fetchInit.signal as AbortSignal | undefined;
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }
  // Always use our controller's signal so the default timeout is enforced
  fetchInit.signal = controller.signal;

  return crossFetch(input, fetchInit)
    .finally(() => clearTimeout(timeoutId))
    .catch((error) => {
      // Provide a clearer error message for timeout
      if (error.name === 'AbortError') {
        throw new Error('Request timeout exceeded');
      }
      throw error;
    });
};

export default patchedFetch as unknown as typeof fetch;
