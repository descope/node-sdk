import type defaultPolyfillFetch from './fetch-polyfill';

// a fetch that never responds and rejects only when its signal aborts
const hangingFetch = (_input: unknown, init?: RequestInit) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  });

describe('fetch-polyfill', () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn();
  let polyfillFetch: typeof defaultPolyfillFetch;

  beforeAll(() => {
    // Node 16 has no global fetch; provide one so the module wraps it on every Node version
    globalThis.fetch = fetchMock;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      polyfillFetch = require('./fetch-polyfill').default;
    });
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    jest.useRealTimers();
    fetchMock.mockReset();
  });

  it('aborts a request that gets no response within 30 seconds', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangingFetch);

    const res = polyfillFetch('https://example.com');
    jest.advanceTimersByTime(30000);

    await expect(res).rejects.toThrow('Request timeout exceeded');
  });

  it('leaves a request with a caller signal to the caller deadline', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation(hangingFetch);
    const controller = new AbortController();
    let settled = false;

    const res = polyfillFetch('https://example.com', { signal: controller.signal });
    res.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    jest.advanceTimersByTime(60000);
    await Promise.resolve();
    expect(settled).toBe(false);

    controller.abort();
    await expect(res).rejects.toMatchObject({ name: 'AbortError', message: 'aborted' });
  });

  it('clears the timeout once a response arrives', async () => {
    jest.useFakeTimers();
    const response = { ok: true };
    fetchMock.mockResolvedValue(response);

    await expect(polyfillFetch('https://example.com')).resolves.toBe(response);
    expect(jest.getTimerCount()).toBe(0);
  });
});
