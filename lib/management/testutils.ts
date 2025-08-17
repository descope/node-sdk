/* istanbul ignore file */
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  buildUrl(path, queryParams) {
    return path + (queryParams ? `?${new URLSearchParams(queryParams).toString()}` : '');
  },
};

const resetMockHttpClient = () =>
  ['get', 'post', 'patch', 'put', 'delete'].forEach((key) =>
    mockHttpClient[key].mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ body: 'body' }),
      clone: () => ({
        json: () => Promise.resolve({ body: 'body' }),
      }),
      status: 200,
    }),
  );

resetMockHttpClient();

const mockCoreSdk = {
  httpClient: mockHttpClient,
} as any;

export { resetMockHttpClient, mockHttpClient, mockCoreSdk };
