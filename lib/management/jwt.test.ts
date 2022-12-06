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

      const resp: SdkResponse<UpdateJWTResponse> = await management.jwt.update('jwt', {
        foo: 'bar',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.jwt.update,
        { jwt: 'jwt', customClaims: { foo: 'bar' } },
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
