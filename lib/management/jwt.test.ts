import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { UpdateJWTResponse } from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockJWTResponse = {
  jwt: 'foo',
};

describe('Management JWT', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockJWTResponse,
        clone: () => ({
          json: () => Promise.resolve(mockJWTResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UpdateJWTResponse> = await management.jwt.update(
        'jwt',
        {
          foo: 'bar',
        },
        4,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.jwt.update,
        { jwt: 'jwt', customClaims: { foo: 'bar' }, refreshDuration: 4 },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('impersonate', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockJWTResponse,
        clone: () => ({
          json: () => Promise.resolve(mockJWTResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UpdateJWTResponse> = await management.jwt.impersonate(
        'imp1',
        'imp2',
        true,
        { k1: 'v1' },
        't1',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.jwt.impersonate,
        {
          impersonatorId: 'imp1',
          loginId: 'imp2',
          validateConsent: true,
          customClaims: { k1: 'v1' },
          selectedTenant: 't1',
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
