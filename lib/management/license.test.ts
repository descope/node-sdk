import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { License } from './types';

const management = withManagement(mockHttpClient);

const mockLicense: License = {
  rateLimitTier: 'tier4',
};

describe('Management License', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('get', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockLicense,
        clone: () => ({
          json: () => Promise.resolve(mockLicense),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<License> = await management.license.get();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.license.get);
      expect(resp).toEqual({
        code: 200,
        data: mockLicense,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
