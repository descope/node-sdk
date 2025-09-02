import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { PasswordSettings } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockPasswordSettings: PasswordSettings = {
  enabled: true,
  minLength: 8,
  expiration: true,
  expirationWeeks: 4,
  lock: true,
  lockAttempts: 5,
  reuse: true,
  reuseAmount: 6,
  lowercase: true,
  uppercase: false,
  number: true,
  nonAlphaNumeric: false,
};

describe('Management Password', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('getSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockPasswordSettings,
        clone: () => ({
          json: () => Promise.resolve(mockPasswordSettings),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<PasswordSettings> = await management.password.getSettings('test');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.password.settings, {
        queryParams: { tenantId: 'test' },
      });

      expect(resp).toEqual({
        code: 200,
        data: mockPasswordSettings,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.password.configureSettings(
        'test',
        mockPasswordSettings,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.password.settings, {
        ...mockPasswordSettings,
        tenantId: 'test',
      });

      expect(resp).toEqual({
        code: 200,
        data: undefined,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
