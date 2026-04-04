import { JWTResponse, SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { UpdateJWTResponse, ClientAssertionResponse } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockJWTResponse = {
  jwt: 'foo',
};

describe('Management JWT', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.update, {
        jwt: 'jwt',
        customClaims: { foo: 'bar' },
        refreshDuration: 4,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });

    it('should reject reserved JWT claims', () => {
      expect(() => management.jwt.update('jwt', { iss: 'malicious-issuer' }, 4)).toThrow(
        'Cannot override reserved JWT claims: iss',
      );

      expect(() =>
        management.jwt.update('jwt', { sub: 'malicious-sub', exp: 9999999999 }, 4),
      ).toThrow('Cannot override reserved JWT claims: sub, exp');
    });

    it('should reject non-object custom claims', () => {
      expect(() => management.jwt.update('jwt', 'not-an-object' as any, 4)).toThrow(
        'Custom claims must be an object',
      );

      expect(() => management.jwt.update('jwt', ['array'] as any, 4)).toThrow(
        'Custom claims must be an object',
      );
    });

    it('should reject oversized custom claims', () => {
      const largeClaims = { data: 'x'.repeat(15000) };
      expect(() => management.jwt.update('jwt', largeClaims, 4)).toThrow(
        'Custom claims exceed maximum size of 10KB',
      );
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.impersonate, {
        impersonatorId: 'imp1',
        loginId: 'imp2',
        validateConsent: true,
        customClaims: { k1: 'v1' },
        selectedTenant: 't1',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('stopImpersonation', () => {
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

      const resp: SdkResponse<UpdateJWTResponse> = await management.jwt.stopImpersonation(
        'jwt',
        { k1: 'v1' },
        't1',
        32,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.stopImpersonation, {
        jwt: 'jwt',
        customClaims: { k1: 'v1' },
        selectedTenant: 't1',
        refreshDuration: 32,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('sign-in', () => {
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

      const resp: SdkResponse<JWTResponse> = await management.jwt.signIn('user-id-1', {
        customClaims: { k1: 'v1' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.signIn, {
        loginId: 'user-id-1',
        customClaims: { k1: 'v1' },
      });

      expect(resp).toEqual({ code: 200, data: mockJWTResponse, ok: true, response: httpResponse });
    });
  });

  describe('sign-up', () => {
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

      const resp: SdkResponse<JWTResponse> = await management.jwt.signUp(
        'user-id-1',
        {
          email: 'test@example.com',
          name: 'lorem ipsum',
        },
        {
          customClaims: { k1: 'v1' },
        },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.signUp, {
        loginId: 'user-id-1',
        user: {
          email: 'test@example.com',
          name: 'lorem ipsum',
        },
        customClaims: { k1: 'v1' },
      });

      expect(resp).toEqual({ code: 200, data: mockJWTResponse, ok: true, response: httpResponse });
    });
  });

  describe('sign-up-or-in', () => {
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

      const resp: SdkResponse<JWTResponse> = await management.jwt.signUpOrIn(
        'user-id-1',
        {
          email: 'test@example.com',
          name: 'lorem ipsum',
        },
        {
          customClaims: { k1: 'v1' },
        },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.signUpOrIn, {
        loginId: 'user-id-1',
        user: {
          email: 'test@example.com',
          name: 'lorem ipsum',
        },
        customClaims: { k1: 'v1' },
      });

      expect(resp).toEqual({ code: 200, data: mockJWTResponse, ok: true, response: httpResponse });
    });
  });

  describe('anonymous', () => {
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

      const resp: SdkResponse<JWTResponse> = await management.jwt.anonymous({ k1: 'v1' }, 't1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.anonymous, {
        customClaims: { k1: 'v1' },
        selectedTenant: 't1',
      });

      expect(resp).toEqual({ code: 200, data: mockJWTResponse, ok: true, response: httpResponse });
    });
  });

  describe('generateClientAssertionJwt', () => {
    it('should send the correct generateClientAssertionJwt request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockJWTResponse,
        clone: () => ({
          json: () => Promise.resolve(mockJWTResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ClientAssertionResponse> =
        await management.jwt.generateClientAssertionJwt(
          'https://example.com/issuer',
          'https://example.com/subject',
          ['https://example.com/token'],
          300,
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.clientAssertion, {
        issuer: 'https://example.com/issuer',
        subject: 'https://example.com/subject',
        audience: ['https://example.com/token'],
        expiresIn: 300,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('generateClientAssertionJwtWithFlattenedAudience', () => {
    it('should send the correct generateClientAssertionJwt request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockJWTResponse,
        clone: () => ({
          json: () => Promise.resolve(mockJWTResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ClientAssertionResponse> =
        await management.jwt.generateClientAssertionJwt(
          'https://example.com/issuer',
          'https://example.com/subject',
          ['https://example.com/token'],
          300,
          true,
          'ES384',
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwt.clientAssertion, {
        issuer: 'https://example.com/issuer',
        subject: 'https://example.com/subject',
        audience: ['https://example.com/token'],
        expiresIn: 300,
        flattenAudience: true,
        algorithm: 'ES384',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockJWTResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
