import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { AnalyticRecord } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockRecord: AnalyticRecord = {
  projectId: 'p1',
  action: 'LoginSucceed',
  created: '1700000000000',
  cnt: '5',
};

const okResponse = (body: any) => ({
  ok: true,
  json: () => body,
  clone: () => ({ json: () => Promise.resolve(body) }),
  status: 200,
});

describe('Management Analytics', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  it('search sends the options and returns records', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ analytics: [mockRecord] }));
    const options = { actions: ['LoginSucceed'], groupByAction: true };
    const resp: SdkResponse<AnalyticRecord[]> = await management.analytics.search(options);
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.analytics.search, options);
    expect(resp.data).toEqual([mockRecord]);
  });
});
