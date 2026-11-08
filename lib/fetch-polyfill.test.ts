import polyfillFetch from './fetch-polyfill';

// a fetch that never responds and rejects only when its signal aborts
const hangingFetch = (_input: unknown, init?: RequestInit) =>
  new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  });

describe('fetch-polyfill', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('aborts a request that gets no response within 30 seconds', async () => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, 'fetch').mockImplementation(hangingFetch);

    const res = polyfillFetch('https://example.com');
    jest.advanceTimersByTime(30000);

    await expect(res).rejects.toThrow('Request timeout exceeded');
  });

  it('passes a caller abort through without reporting a timeout', async () => {
    jest.spyOn(globalThis, 'fetch').mockImplementation(hangingFetch);
    const controller = new AbortController();

    const res = polyfillFetch('https://example.com', { signal: controller.signal });
    controller.abort();

    await expect(res).rejects.toMatchObject({ name: 'AbortError', message: 'aborted' });
  });

  it('clears the timeout once a response arrives', async () => {
    jest.useFakeTimers();
    const response = new Response('ok');
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);

    await expect(polyfillFetch('https://example.com')).resolves.toBe(response);
    expect(jest.getTimerCount()).toBe(0);
  });
});
