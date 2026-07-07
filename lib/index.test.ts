import { JWTResponse, SdkResponse, ExchangeAccessKeyResponse } from '@descope/core-js-sdk';
import { JWK, SignJWT, exportJWK, JWTHeaderParameters, generateKeyPair } from 'jose';
import createSdk from '.';
import { AuthenticationInfo } from './types';
import {
  refreshTokenCookieName,
  authorizedTenantsClaimName,
  permissionsClaimName,
  rolesClaimName,
  sessionTokenCookieName,
} from './constants';
import { getCookieValue } from './helpers';
import fetchPolyfill from './fetch-polyfill';

// The federated client_credentials flow calls the fetch polyfill directly (not via the
// core HTTP client), so mock the polyfill to control those requests deterministically.
// This avoids relying on a global `fetch`, which is not present in jest's sandbox.
jest.mock('./fetch-polyfill', () => {
  const actual = jest.requireActual('./fetch-polyfill');
  return { __esModule: true, ...actual, default: jest.fn() };
});

const mockFetch = fetchPolyfill as unknown as jest.Mock;

let validToken: string;
let validTokenIssuerURL: string;
let validTokenIssuerMcpStyleURL: string;
let invalidTokenIssuerHostMatch: string;
let invalidTokenIssuerDeepPath: string;
let invalidTokenIssuer: string;
let expiredToken: string;
let publicKeys: JWK;
// Audience-specific tokens
let tokenAudA: string;
let tokenAudB: string;
let expiredTokenAudA: string;
let permAuthInfo: AuthenticationInfo;
let permTenantAuthInfo: AuthenticationInfo;

const logger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const sdk = createSdk({
  projectId: 'project-id',
  logger,
});

const get = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc[part], obj) as Function;
const generatePathFromKeys = (obj: Record<string, any>, path: string) =>
  Object.keys(get(obj, path)).map((key) => `${path}.${key}`);

describe('sdk', () => {
  beforeAll(async () => {
    const { publicKey, privateKey } = await generateKeyPair('ES384');
    validToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('project-id')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    // Valid tokens with audience claims
    tokenAudA = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setAudience('aud-a')
      .setIssuedAt()
      .setIssuer('project-id')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    tokenAudB = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setAudience('aud-b')
      .setIssuedAt()
      .setIssuer('project-id')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    validTokenIssuerURL = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://descope.com/bla/project-id')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    validTokenIssuerMcpStyleURL = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://auth.example.com/v1/apps/agentic/project-id/mcp-server-id-segment')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    invalidTokenIssuerHostMatch = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://project-id/other')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    invalidTokenIssuerDeepPath = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://auth.example.com/v1/apps/project-id/mcp-server/extra')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    invalidTokenIssuer = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://descope.com/bla/bla')
      .setExpirationTime(1981398111)
      .sign(privateKey);
    expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt(1181398100)
      .setIssuer('project-id')
      .setExpirationTime(1181398111)
      .sign(privateKey);
    expiredTokenAudA = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setAudience('aud-a')
      .setIssuedAt(1181398100)
      .setIssuer('project-id')
      .setExpirationTime(1181398111)
      .sign(privateKey);
    permAuthInfo = {
      jwt: 'jwt',
      token: { [permissionsClaimName]: ['foo', 'bar'], [rolesClaimName]: ['abc', 'xyz'] },
    };
    permTenantAuthInfo = {
      jwt: 'jwt',
      token: {
        [authorizedTenantsClaimName]: {
          kuku: { [permissionsClaimName]: ['foo', 'bar'], [rolesClaimName]: ['abc', 'xyz'] },
          t1: {},
        },
      },
    };
    publicKeys = await exportJWK(publicKey);
    publicKeys.alg = 'ES384';
    publicKeys.kid = '0ad99869f2d4e57f3f71c68300ba84fa';
    publicKeys.use = 'sig';
    jest
      .spyOn(sdk.httpClient, 'get')
      .mockResolvedValue({ json: () => Promise.resolve({ keys: [publicKeys] }) } as Response);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('validateToken', () => {
    it('should return the token payload when valid', async () => {
      const resp = await sdk.validateJwt(validToken);
      expect(resp).toMatchObject({
        token: {
          exp: 1981398111,
          iss: 'project-id',
        },
      });
    });

    it('should return the token payload when issuer is url and valid', async () => {
      const resp = await sdk.validateJwt(validTokenIssuerURL);
      expect(resp).toMatchObject({
        token: {
          exp: 1981398111,
          iss: 'project-id',
        },
      });
    });

    it('should return the token payload when issuer is MCP-style url (project id not last segment)', async () => {
      const resp = await sdk.validateJwt(validTokenIssuerMcpStyleURL);
      expect(resp).toMatchObject({
        token: {
          exp: 1981398111,
          iss: 'project-id',
        },
      });
    });

    it('should reject with a proper error message when token issuer invalid', async () => {
      await expect(sdk.validateJwt(invalidTokenIssuer)).rejects.toThrow(
        'unexpected "iss" claim value',
      );
    });

    it('should reject when only issuer host matches project id', async () => {
      await expect(sdk.validateJwt(invalidTokenIssuerHostMatch)).rejects.toThrow(
        'unexpected "iss" claim value',
      );
    });

    it('should reject when project id is deeper than supported issuer path positions', async () => {
      await expect(sdk.validateJwt(invalidTokenIssuerDeepPath)).rejects.toThrow(
        'unexpected "iss" claim value',
      );
    });

    it('should reject with a proper error message when token expired', async () => {
      await expect(sdk.validateJwt(expiredToken)).rejects.toThrow(
        '"exp" claim timestamp check failed',
      );
    });
  });

  describe('audience validation', () => {
    it('should reject when audience is required but missing in token', async () => {
      // Calling with an audience should enforce aud claim; current implementation ignores it.
      await expect(
        (sdk as any).validateSession(validToken, { audience: 'expected-aud' }),
      ).rejects.toThrow('session validation failed');
    });

    it('should reject when audience mismatches in token for validateSession', async () => {
      await expect((sdk as any).validateSession(tokenAudA, { audience: 'aud-b' })).rejects.toThrow(
        'session validation failed',
      );
    });

    it('should accept when audience matches in token for validateSession', async () => {
      // This may pass before implementation but documents expected behavior post-change
      await expect(
        (sdk as any).validateSession(tokenAudA, { audience: 'aud-a' }),
      ).resolves.toHaveProperty('jwt', tokenAudA);
    });

    it('should reject when audience mismatches in validateJwt', async () => {
      await expect((sdk as any).validateJwt(tokenAudB, { audience: 'aud-a' })).rejects.toBeTruthy();
    });

    it('should reject when refreshSession returns session with mismatched audience', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: tokenAudB },
      } as SdkResponse<JWTResponse>);

      await expect((sdk as any).refreshSession(validToken, { audience: 'aud-a' })).rejects.toThrow(
        'refresh token validation failed',
      );
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });

    it('should reject when validateAndRefreshSession refreshes to mismatched audience', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: tokenAudB },
      } as SdkResponse<JWTResponse>);

      await expect(
        (sdk as any).validateAndRefreshSession(expiredTokenAudA, validToken, { audience: 'aud-a' }),
      ).rejects.toThrow('refresh token validation failed');
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });

    it('should accept when any of audiences matches (array)', async () => {
      await expect(
        (sdk as any).validateSession(tokenAudA, { audience: ['nope', 'aud-a'] }),
      ).resolves.toHaveProperty('jwt', tokenAudA);
    });
  });

  describe('getKey', () => {
    it('should throw an error when key does not exist', async () => {
      await expect(sdk.getKey({ kid: 'unknown-key' } as JWTHeaderParameters)).rejects.toThrow(
        'failed to fetch matching key',
      );
    });
    it('should return the key from cache if exists', async () => {
      const newSdk = createSdk({
        projectId: 'project-id',
        logger,
      });

      jest
        .spyOn(newSdk.httpClient, 'get')
        .mockResolvedValue({ json: () => Promise.resolve({ keys: [publicKeys] }) } as Response);

      await newSdk.getKey({ kid: publicKeys.kid } as JWTHeaderParameters);
      await newSdk.getKey({ kid: publicKeys.kid } as JWTHeaderParameters);

      expect(newSdk.httpClient.get).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when kid is empty', async () => {
      await expect(sdk.getKey({ kid: '' } as JWTHeaderParameters)).rejects.toThrow(
        'header.kid must not be empty',
      );
    });
  });

  describe('validateSession', () => {
    it('should throw an error when session token is empty', async () => {
      await expect(sdk.validateSession('')).rejects.toThrow(
        'session token is required for validation',
      );
    });
    it('should return the token when session token is valid', async () => {
      await expect(sdk.validateSession(validToken)).resolves.toMatchObject({
        token: { exp: 1981398111, iss: 'project-id' },
      });
    });
    it('should throw an error when session token expired', async () => {
      await expect(sdk.validateSession(expiredToken)).rejects.toThrow('session validation failed');
    });
  });

  describe('refreshSession', () => {
    it('should throw an error when refresh token is empty', async () => {
      await expect(sdk.refreshSession('')).rejects.toThrow(
        'refresh token is required to refresh a session',
      );
    });
    it('should throw an error when refresh token expired', async () => {
      await expect(sdk.refreshSession(expiredToken)).rejects.toThrow(
        'refresh token validation failed',
      );
    });
    it('should refresh session token when refresh token is valid', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken },
      } as SdkResponse<JWTResponse>);

      const res = await sdk.refreshSession(validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.refreshJwt).toBeFalsy();
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should return refresh jwt when refresh call returns it', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken, refreshJwt: 'refresh-jwt' },
      } as SdkResponse<JWTResponse>);

      const res = await sdk.refreshSession(validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.refreshJwt).toBe('refresh-jwt');
      expect(res.cookies).toStrictEqual([]);
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should return only cookies when refresh call returns it', async () => {
      const expectedCookies = [
        `${sessionTokenCookieName}=${validToken}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
        `${refreshTokenCookieName}=${validToken}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
      ];
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: '', refreshJwt: null, cookies: expectedCookies },
      } as unknown as SdkResponse<JWTResponse>);

      const res = await sdk.refreshSession(validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.cookies).toBe(expectedCookies);
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should return refrehs in cookie when refresh call returns it', async () => {
      const expectedCookies = [
        `${refreshTokenCookieName}=${validToken}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
      ];
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken, refreshJwt: null, cookies: expectedCookies },
      } as unknown as SdkResponse<JWTResponse>);

      const res = await sdk.refreshSession(validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.cookies).toBe(expectedCookies);
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should fail when refresh returns an error', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: false,
        error: { errorMessage: 'something went wrong' },
      } as unknown as SdkResponse<JWTResponse>);

      await expect(sdk.refreshSession(validToken)).rejects.toThrow(
        'refresh token validation failed',
      );
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should fail when receiving unexpected empty response', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
      } as SdkResponse<JWTResponse>);

      await expect(sdk.refreshSession(validToken)).rejects.toThrow(
        'refresh token validation failed',
      );
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
  });

  describe('refresh', () => {
    it('should call coreSdk.refresh with the correct arguments', async () => {
      jest.resetModules();
      const refresh = jest.fn();
      jest.doMock('@descope/core-js-sdk', () => {
        const actual = jest.requireActual('@descope/core-js-sdk');
        return {
          ...actual,
          __esModule: true,
          wrapWith: (sdkInstance: object) => sdkInstance,
          default: (...args: any[]) => ({ ...actual.default(...args), refresh }),
        };
      });

      const createNodeSdk = require('.').default; // eslint-disable-line
      const sdkInstance = createNodeSdk({ projectId: 'project-id' });

      const token = 'test-token';
      const externalToken = 'external-token';
      await sdkInstance.refresh(token, externalToken);

      expect(refresh).toHaveBeenCalledWith(token, undefined, externalToken);
    });
  });

  describe('validateAndRefreshSession', () => {
    it('should throw an error when both session or refresh tokens are empty', async () => {
      await expect(sdk.validateAndRefreshSession('', '')).rejects.toThrow(
        'both session and refresh tokens are empty',
      );
    });
    it('should throw an error when both refresh & session tokens expired', async () => {
      await expect(sdk.validateAndRefreshSession(expiredToken, expiredToken)).rejects.toThrow(
        'refresh token validation failed',
      );
    });
    it('should refresh session token when it expired and refresh token is valid', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken },
      } as SdkResponse<JWTResponse>);

      await expect(sdk.validateAndRefreshSession(expiredToken, validToken)).resolves.toHaveProperty(
        'jwt',
        validToken,
      );
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should refresh session token when it not given and refresh token is valid', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken },
      } as SdkResponse<JWTResponse>);
      const res = await sdk.validateAndRefreshSession('', validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.refreshJwt).toBeFalsy();
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should refresh session and return refresh jwt when refresh call returns it', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken, refreshJwt: 'refresh-jwt' },
      } as SdkResponse<JWTResponse>);
      const res = await sdk.validateAndRefreshSession('', validToken);
      expect(res.jwt).toBe(validToken);
      expect(res.refreshJwt).toBe('refresh-jwt');
      expect(spyRefresh).toHaveBeenCalledWith(validToken);
    });
    it('should return the session token when it is valid', async () => {
      const spyRefresh = jest.spyOn(sdk, 'refresh');

      await expect(sdk.validateAndRefreshSession(validToken, validToken)).resolves.toHaveProperty(
        'jwt',
        validToken,
      );
      expect(spyRefresh).not.toHaveBeenCalled();

      // Even without a refresh token
      await expect(sdk.validateAndRefreshSession(validToken, '')).resolves.toHaveProperty(
        'jwt',
        validToken,
      );
      expect(spyRefresh).not.toHaveBeenCalled();
    });
  });

  describe('exchangeAccessKey', () => {
    it('should fail when the server call throws', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockRejectedValueOnce('error');
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key');
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });
    it('should fail when getting an unexpected response from the server', async () => {
      const spyExchange = jest
        .spyOn(sdk.accessKey, 'exchange')
        .mockResolvedValueOnce({ ok: true, data: {} } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key');
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });
    it('should fail when getting an error response from the server', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        ok: false,
        error: {
          errorMessage: 'error-1',
        },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow(
        'could not exchange access key - error-1',
      );
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });
    it('should fail when the session token the server returns is invalid', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: expiredToken },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key');
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });
    it('should return the same session token it got from the server', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: validToken },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      const expected: AuthenticationInfo = {
        jwt: validToken,
        token: { exp: 1981398111, iss: 'project-id' },
      };
      const loginOptions = { customClaims: { k1: 'v1' } };
      await expect(sdk.exchangeAccessKey('key', loginOptions)).resolves.toMatchObject(expected);
      expect(spyExchange).toHaveBeenCalledWith('key', loginOptions);
    });

    it('should enforce audience on exchangeAccessKey when provided (match)', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: tokenAudA },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(
        sdk.exchangeAccessKey('key', undefined, { audience: 'aud-a' }),
      ).resolves.toHaveProperty('jwt', tokenAudA);
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });

    it('should fail exchangeAccessKey when audience mismatches', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        ok: true,
        data: { sessionJwt: tokenAudB },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key', undefined, { audience: 'aud-a' })).rejects.toThrow(
        'could not exchange access key - failed to validate jwt',
      );
      expect(spyExchange).toHaveBeenCalledWith('key', undefined);
    });
  });

  describe('exchangeClientCredentials', () => {
    const mockTokenResponse = (body: Record<string, any>, ok = true, statusText = '') =>
      ({
        ok,
        statusText,
        json: () => Promise.resolve(body),
      } as Response);

    afterEach(() => {
      // Reset calls and implementation so a persistent mock doesn't leak between tests.
      mockFetch.mockReset();
    });

    it('should fail when client id is empty', async () => {
      await expect(sdk.exchangeClientCredentials('', 'secret')).rejects.toThrow(
        'client id must not be empty',
      );
    });
    it('should fail when client secret is empty', async () => {
      await expect(sdk.exchangeClientCredentials('client', '')).rejects.toThrow(
        'client secret must not be empty',
      );
    });
    it('should fail when the server call throws', async () => {
      mockFetch.mockRejectedValueOnce('error');
      await expect(sdk.exchangeClientCredentials('client', 'secret')).rejects.toThrow(
        'could not exchange client credentials - Failed to exchange',
      );
    });
    it('should fail when getting an error response from the server', async () => {
      mockFetch.mockResolvedValueOnce(
        mockTokenResponse({ error: 'invalid_client', error_description: 'bad secret' }, false),
      );
      await expect(sdk.exchangeClientCredentials('client', 'secret')).rejects.toThrow(
        'could not exchange client credentials - bad secret',
      );
    });
    it('should fail when getting an unexpected response from the server', async () => {
      mockFetch.mockResolvedValueOnce(mockTokenResponse({}));
      await expect(sdk.exchangeClientCredentials('client', 'secret')).rejects.toThrow(
        'could not exchange client credentials',
      );
    });
    it('should fail when the access token the server returns is invalid', async () => {
      mockFetch.mockResolvedValueOnce(mockTokenResponse({ access_token: expiredToken }));
      await expect(sdk.exchangeClientCredentials('client', 'secret')).rejects.toThrow(
        'could not exchange client credentials',
      );
    });
    it('should send a form-urlencoded request with grant params for inbound apps', async () => {
      mockFetch.mockResolvedValueOnce(mockTokenResponse({ access_token: validToken }));
      const spyPost = jest.spyOn(sdk.httpClient, 'post');
      const expected: AuthenticationInfo = {
        jwt: validToken,
        token: { exp: 1981398111, iss: 'project-id' },
      };
      await expect(
        sdk.exchangeClientCredentials('client', 'secret', { scope: 'openid email' }),
      ).resolves.toMatchObject(expected);

      // The JSON core client must not be used; the token request is form-encoded
      expect(spyPost).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.descope.com/oauth2/v1/apps/token');
      expect(init.method).toBe('POST');
      expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
      expect(init.headers['x-descope-project-id']).toBe('project-id');
      expect(init.body).toBe(
        'grant_type=client_credentials&scope=openid+email&client_id=client&client_secret=secret',
      );
    });
    it('should enforce audience when provided (match)', async () => {
      mockFetch.mockResolvedValueOnce(mockTokenResponse({ access_token: tokenAudA }));
      await expect(
        sdk.exchangeClientCredentials('client', 'secret', undefined, { audience: 'aud-a' }),
      ).resolves.toHaveProperty('jwt', tokenAudA);
    });
    it('should fail when audience mismatches', async () => {
      mockFetch.mockResolvedValueOnce(mockTokenResponse({ access_token: tokenAudB }));
      await expect(
        sdk.exchangeClientCredentials('client', 'secret', undefined, { audience: 'aud-a' }),
      ).rejects.toThrow('could not exchange client credentials - failed to validate jwt');
    });

    describe('federated apps', () => {
      // The federated flow resolves the token endpoint from the discovery document,
      // caching it per discovery URL. Use a distinct URL per test to avoid cache reuse.
      const tokenEndpoint = 'https://auth.example.com/sso-app-id/oauth2/v1/token';

      it('should fail when discoveryUrl is missing for a federated app', async () => {
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', { appType: 'federated' }),
        ).rejects.toThrow('discoveryUrl is required for federated apps');
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should resolve the token endpoint from discovery and use basic auth + a form body', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s1/.well-known/openid-configuration';
        mockFetch
          .mockResolvedValueOnce(mockTokenResponse({ token_endpoint: tokenEndpoint }))
          .mockResolvedValueOnce(mockTokenResponse({ access_token: validToken }));
        const spyPost = jest.spyOn(sdk.httpClient, 'post');
        const expected: AuthenticationInfo = {
          jwt: validToken,
          token: { exp: 1981398111, iss: 'project-id' },
        };
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', {
            appType: 'federated',
            discoveryUrl,
            scope: 'openid email',
          }),
        ).resolves.toMatchObject(expected);

        // The inbound (JSON) client must not be used for federated apps
        expect(spyPost).not.toHaveBeenCalled();

        expect(mockFetch).toHaveBeenCalledTimes(2);
        // First call fetches the discovery document
        const [discoveryReqUrl, discoveryInit] = mockFetch.mock.calls[0];
        expect(discoveryReqUrl).toBe(discoveryUrl);
        expect(discoveryInit.method).toBe('GET');
        // Second call hits the token_endpoint from the discovery document
        const [url, init] = mockFetch.mock.calls[1];
        expect(url).toBe(tokenEndpoint);
        expect(init.method).toBe('POST');
        expect(init.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
        // base64('client:secret')
        expect(init.headers.Authorization).toBe('Basic Y2xpZW50OnNlY3JldA==');
        expect(init.body).toBe('grant_type=client_credentials&scope=openid+email');
      });

      it('should cache the discovery document across calls with the same discoveryUrl', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s2/.well-known/openid-configuration';
        mockFetch
          .mockResolvedValueOnce(mockTokenResponse({ token_endpoint: tokenEndpoint }))
          .mockResolvedValue(mockTokenResponse({ access_token: validToken }));
        const opts = { appType: 'federated' as const, discoveryUrl };
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', opts),
        ).resolves.toHaveProperty('jwt', validToken);
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', opts),
        ).resolves.toHaveProperty('jwt', validToken);
        // discovery (1) + two token requests (2) = 3, i.e. discovery was fetched only once
        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should fail when the discovery document has no token_endpoint', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s3/.well-known/openid-configuration';
        mockFetch.mockResolvedValueOnce(mockTokenResponse({}));
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', { appType: 'federated', discoveryUrl }),
        ).rejects.toThrow('could not exchange client credentials - token_endpoint missing');
      });

      it('should fail when the federated token endpoint returns an error', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s4/.well-known/openid-configuration';
        mockFetch
          .mockResolvedValueOnce(mockTokenResponse({ token_endpoint: tokenEndpoint }))
          .mockResolvedValueOnce(
            mockTokenResponse({ error: 'invalid_client', error_description: 'nope' }, false),
          );
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', { appType: 'federated', discoveryUrl }),
        ).rejects.toThrow('could not exchange client credentials - nope');
      });

      it('should fail when the discovery fetch throws', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s5/.well-known/openid-configuration';
        mockFetch.mockRejectedValueOnce('boom');
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', { appType: 'federated', discoveryUrl }),
        ).rejects.toThrow('could not exchange client credentials - failed to fetch discovery');
      });

      it('should fail when the federated token call throws', async () => {
        const discoveryUrl = 'https://auth.example.com/p/s6/.well-known/openid-configuration';
        mockFetch
          .mockResolvedValueOnce(mockTokenResponse({ token_endpoint: tokenEndpoint }))
          .mockRejectedValueOnce('boom');
        await expect(
          sdk.exchangeClientCredentials('client', 'secret', { appType: 'federated', discoveryUrl }),
        ).rejects.toThrow('could not exchange client credentials - Failed to exchange');
      });
    });
  });

  describe('validatePermissionsRoles', () => {
    it('should always succeed with empty requirements', () => {
      expect(sdk.validatePermissions(permAuthInfo, [])).toStrictEqual(true);
      expect(sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', [])).toStrictEqual(true);
      expect(sdk.validateRoles(permAuthInfo, [])).toStrictEqual(true);
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', [])).toStrictEqual(true);
    });
    it('should succeed when requirements are met', () => {
      expect(sdk.validatePermissions(permAuthInfo, ['foo'])).toStrictEqual(true);
      expect(
        sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', ['foo', 'bar']),
      ).toStrictEqual(true);
      expect(sdk.validateRoles(permAuthInfo, ['abc'])).toStrictEqual(true);
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', ['abc', 'xyz'])).toStrictEqual(
        true,
      );
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 't1', [])).toStrictEqual(true);
      expect(sdk.validateTenantPermissions(permTenantAuthInfo, 't1', [])).toStrictEqual(true);
    });
    it('should fail when wrong function is used', () => {
      expect(sdk.validatePermissions(permTenantAuthInfo, ['foo'])).toStrictEqual(false);
      expect(sdk.validateTenantPermissions(permAuthInfo, 'kuku', ['foo'])).toStrictEqual(false);
      expect(sdk.validateRoles(permTenantAuthInfo, ['abc'])).toStrictEqual(false);
      expect(sdk.validateTenantRoles(permAuthInfo, 'kuku', ['abc'])).toStrictEqual(false);
    });
    it('should fail when requirements are not met', () => {
      expect(sdk.validatePermissions(permAuthInfo, ['foo', 'bar', 'qux'])).toStrictEqual(false);
      expect(
        sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', ['foo', 'bar', 'qux']),
      ).toStrictEqual(false);
      expect(sdk.validateRoles(permAuthInfo, ['abc', 'xyz', 'tuv'])).toStrictEqual(false);
      expect(
        sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', ['abc', 'xyz', 'tuv']),
      ).toStrictEqual(false);
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 't2', [])).toStrictEqual(false);
      expect(sdk.validateTenantPermissions(permTenantAuthInfo, 't2', [])).toStrictEqual(false);
    });
  });

  describe('getMatchedPermissionsRoles', () => {
    it('should always succeed with empty requirements', () => {
      expect(sdk.getMatchedPermissions(permAuthInfo, [])).toStrictEqual([]);
      expect(sdk.getMatchedTenantPermissions(permTenantAuthInfo, 'kuku', [])).toStrictEqual([]);
      expect(sdk.getMatchedRoles(permAuthInfo, [])).toStrictEqual([]);
      expect(sdk.getMatchedTenantPermissions(permTenantAuthInfo, 'kuku', [])).toStrictEqual([]);
    });
    it('should return the matched permissions or roles', () => {
      // all permissions matched
      expect(sdk.getMatchedPermissions(permAuthInfo, ['foo'])).toStrictEqual(['foo']);
      // some permissions are matched
      expect(
        sdk.getMatchedTenantPermissions(permTenantAuthInfo, 'kuku', ['foo', 'bar', 'qux']),
      ).toStrictEqual(['foo', 'bar']);
      // all roles matched
      expect(sdk.getMatchedRoles(permAuthInfo, ['abc'])).toStrictEqual(['abc']);
      // some roles are matched
      expect(
        sdk.getMatchedTenantRoles(permTenantAuthInfo, 'kuku', ['abc', 'xyz', 'tuv']),
      ).toStrictEqual(['abc', 'xyz']);
    });

    it('should return empty list when there are no matched permissions or roles', () => {
      // no permissions matched
      expect(sdk.getMatchedPermissions(permAuthInfo, ['qux'])).toStrictEqual([]);
      expect(
        sdk.getMatchedTenantPermissions(permTenantAuthInfo, 'kuku', ['qux', 'zuk']),
      ).toStrictEqual([]);
      // no roles matched
      expect(sdk.getMatchedRoles(permAuthInfo, ['tuv'])).toStrictEqual([]);
      // some roles are matched
      expect(sdk.getMatchedTenantRoles(permTenantAuthInfo, 'kuku', ['tuv', 'rum'])).toStrictEqual(
        [],
      );
    });
  });

  describe('withCookies', () => {
    describe('when no cookie', () => {
      const paths = [
        ...generatePathFromKeys(sdk, 'otp.verify'),
        'notp.waitForSession',
        ...generatePathFromKeys(sdk, 'enchantedLink.signUp'),
        ...generatePathFromKeys(sdk, 'enchantedLink.signIn'),
        'enchantedLink.waitForSession',
        'magicLink.verify',
        'oauth.exchangeOneTapIDToken',
        'password.signIn',
        'password.signUp',
        'password.replace',
        'oauth.exchange',
        'saml.exchange',
        'totp.verify',
        'selectTenant',
        'webauthn.signIn.finish',
        'webauthn.signUp.finish',
        'refresh',
      ];

      it.each(paths)('should generate cookie from body jwt for %s', async (path) => {
        const data = { sessionJwt: 'sessionJwt', refreshJwt: 'refreshJwt' };
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
          clone() {
            return this;
          },
        } as Response);
        jest.spyOn(sdk.httpClient, 'get').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
          clone() {
            return this;
          },
        } as Response);

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              ...data,
              cookies: [
                `${refreshTokenCookieName}=${data.refreshJwt}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
              ],
            },
          }),
        );
      });

      it.each(paths)('should generate jwt from cookie for %s', async (path) => {
        const data = { sessionJwt: 'sessionJwt' };
        const cookie = `${refreshTokenCookieName}=refreshJwt; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`;
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
          headers: new Headers({ 'set-cookie': cookie }),
          clone() {
            return this;
          },
        } as Response);

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              refreshJwt: 'refreshJwt',
              sessionJwt: 'sessionJwt',
              cookies: [cookie],
            },
          }),
        );
      });
    });
  });

  describe('hooks', () => {
    it('should add descope headers to request', async () => {
      jest.resetModules();
      const createCoreJs = jest.fn();
      const createHttpClient = jest.fn();
      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
        createHttpClient,
        wrapWith: (sdkInstance: object) => sdkInstance,
        addHooksToConfig: (config, hooks) => {
          // eslint-disable-next-line no-param-reassign
          config.hooks = hooks;
          return config;
        },
      }));
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({
        projectId: 'project-id',
        logger,
        baseHeaders: { test: '123' },
      });

      expect(createCoreJs).toHaveBeenCalledWith(
        expect.objectContaining({
          baseHeaders: {
            test: '123',
            'x-descope-sdk-name': 'nodejs',
            'x-descope-sdk-node-version': process?.versions?.node || '',
            'x-descope-sdk-version': 'one.two.three',
          },
        }),
      );
    });

    it('should add auth management key to request when there is no token', async () => {
      jest.resetModules();
      const createCoreJs = jest.fn();
      const createHttpClient = jest.fn();

      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
        createHttpClient,
        wrapWith: (sdkInstance: object) => sdkInstance,
        addHooksToConfig: (config, hooks) => {
          // eslint-disable-next-line no-param-reassign
          config.hooks = hooks;
          return config;
        },
      }));
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({
        projectId: 'project-id',
        authManagementKey: 'auth-management-key-123',
      });

      expect(createCoreJs).toHaveBeenCalledWith(
        expect.objectContaining({
          hooks: expect.objectContaining({
            beforeRequest: expect.any(Array),
          }),
        }),
      );

      // Get the hooks that were passed
      const config = createCoreJs.mock.calls[0][0];
      const beforeRequestHooks = config.hooks.beforeRequest;

      // Test the first hook (our auth management key hook)
      const requestConfig = { url: 'test' };
      const result = beforeRequestHooks[0](requestConfig);

      expect(result.token).toBe('auth-management-key-123');
    });
    it('should add auth management key to request when there is token', async () => {
      jest.resetModules();
      const createCoreJs = jest.fn();
      const createHttpClient = jest.fn();

      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
        createHttpClient,
        wrapWith: (sdkInstance: object) => sdkInstance,
        addHooksToConfig: (config, hooks) => {
          // eslint-disable-next-line no-param-reassign
          config.hooks = hooks;
          return config;
        },
      }));
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({
        projectId: 'project-id',
        authManagementKey: 'auth-management-key-123',
      });

      // Get the hooks that were passed
      const config = createCoreJs.mock.calls[0][0];
      const beforeRequestHooks = config.hooks.beforeRequest;

      // Test the first hook with existing token
      const requestConfig = { url: 'test', token: 'existing-token' };
      const result = beforeRequestHooks[0](requestConfig);

      expect(result.token).toBe('existing-token:auth-management-key-123');
    });
    it('should merge before request hooks if they are defined', async () => {
      jest.resetModules();
      const createCoreJs = jest.fn();
      const createHttpClient = jest.fn();
      const existingHook = jest.fn((config) => ({ ...config, customField: 'test' }));

      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
        createHttpClient,
        wrapWith: (sdkInstance: object) => sdkInstance,
        addHooksToConfig: (config, hooks) => {
          // eslint-disable-next-line no-param-reassign
          config.hooks = hooks;
          return config;
        },
      }));
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({
        projectId: 'project-id',
        authManagementKey: 'auth-management-key-123',
        hooks: {
          beforeRequest: [existingHook],
        },
      });

      const config = createCoreJs.mock.calls[0][0];
      const beforeRequestHooks = config.hooks.beforeRequest;

      // Should have 2 hooks: our auth management hook + the existing hook
      expect(beforeRequestHooks).toHaveLength(2);

      // Test that both hooks are executed
      const requestConfig = { url: 'test' };
      const afterFirstHook = beforeRequestHooks[0](requestConfig);
      const afterSecondHook = beforeRequestHooks[1](afterFirstHook);

      expect(afterFirstHook.token).toBe('auth-management-key-123');
      expect(afterSecondHook.customField).toBe('test');
      expect(existingHook).toHaveBeenCalledWith(afterFirstHook);
    });
  });

  describe('license handshake', () => {
    const setupMocks = (licenseGet: jest.Mock) => {
      jest.resetModules();
      const createCoreJs = jest.fn(() => ({}));
      const createHttpClient = jest.fn();

      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
        createHttpClient,
        wrapWith: (sdkInstance: object) => sdkInstance,
        addHooksToConfig: (config, hooks) => {
          // eslint-disable-next-line no-param-reassign
          config.hooks = hooks;
          return config;
        },
      }));
      jest.doMock('./management', () => ({
        __esModule: true,
        default: () => ({}),
      }));
      jest.doMock('./management/license', () => ({
        __esModule: true,
        default: () => ({ get: licenseGet }),
      }));

      return { createCoreJs, createHttpClient };
    };

    const getMgmtBeforeRequest = (createHttpClient: jest.Mock) => {
      const mgmtConfig = createHttpClient.mock.calls[0][0];
      return mgmtConfig.hooks.beforeRequest[0];
    };

    const flushPromises = () =>
      new Promise<void>((resolve) => {
        setImmediate(resolve);
      });

    it('should skip handshake when no management key', () => {
      const licenseGet = jest.fn();
      setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({ projectId: 'project-id' });

      expect(licenseGet).not.toHaveBeenCalled();
    });

    it('should inject x-descope-license header after handshake resolves', async () => {
      const licenseGet = jest.fn().mockResolvedValue({
        ok: true,
        data: { rateLimitTier: 'tier3' },
      });
      const { createHttpClient } = setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({ projectId: 'project-id', managementKey: 'mk' });

      expect(licenseGet).toHaveBeenCalled();
      await flushPromises();

      const beforeRequest = getMgmtBeforeRequest(createHttpClient);
      const result = beforeRequest({ url: 'test' });
      expect(result.headers).toEqual({ 'x-descope-license': 'tier3' });
      expect(result.token).toBe('mk');
    });

    it('should not inject header before handshake resolves', () => {
      const licenseGet = jest.fn().mockReturnValue(new Promise(() => {}));
      const { createHttpClient } = setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({ projectId: 'project-id', managementKey: 'mk' });

      const beforeRequest = getMgmtBeforeRequest(createHttpClient);
      const result = beforeRequest({ url: 'test' });
      expect(result.headers).toBeUndefined();
      expect(result.token).toBe('mk');
    });

    it('should not inject header when response is not ok', async () => {
      const licenseGet = jest.fn().mockResolvedValue({ ok: false, data: undefined });
      const { createHttpClient } = setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({ projectId: 'project-id', managementKey: 'mk' });
      await flushPromises();

      const beforeRequest = getMgmtBeforeRequest(createHttpClient);
      const result = beforeRequest({ url: 'test' });
      expect(result.headers).toBeUndefined();
    });

    it('should log a warning when handshake rejects', async () => {
      const err = new Error('boom');
      const licenseGet = jest.fn().mockRejectedValue(err);
      const warnLogger = { warn: jest.fn() };
      const { createHttpClient } = setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      createNodeSdk({
        projectId: 'project-id',
        managementKey: 'mk',
        logger: warnLogger,
      });
      await flushPromises();

      expect(warnLogger.warn).toHaveBeenCalledWith('License handshake failed', err);

      const beforeRequest = getMgmtBeforeRequest(createHttpClient);
      const result = beforeRequest({ url: 'test' });
      expect(result.headers).toBeUndefined();
    });

    it('should not throw when handshake rejects and logger is undefined', async () => {
      const licenseGet = jest.fn().mockRejectedValue(new Error('boom'));
      setupMocks(licenseGet);
      const createNodeSdk = require('.').default; // eslint-disable-line

      expect(() => createNodeSdk({ projectId: 'project-id', managementKey: 'mk' })).not.toThrow();
      await flushPromises();
    });
  });

  describe('public key', () => {
    it('should headers to request', async () => {
      const { publicKey, privateKey } = await generateKeyPair('ES384');
      validToken = await new SignJWT({})
        .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
        .setIssuedAt()
        .setIssuer('project-id')
        .setExpirationTime(1981398111)
        .sign(privateKey);

      publicKeys = await exportJWK(publicKey);
      publicKeys.alg = 'ES384';
      publicKeys.kid = '0ad99869f2d4e57f3f71c68300ba84fa';
      publicKeys.use = 'sig';

      const newSdk = createSdk({
        projectId: 'project-id',
        publicKey: JSON.stringify(publicKeys),
      });

      await newSdk.validateJwt(validToken);
      jest
        .spyOn(newSdk.httpClient, 'get')
        .mockResolvedValue({ json: () => Promise.resolve({ keys: [publicKeys] }) } as Response);

      // ensure that /keys is not called
      expect(newSdk.httpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('utils', () => {
    it('should get cookie value', () => {
      const cookie =
        'DS=s1.s2.s3; Path=/; Domain=api.descope.com; Expires=Tue, 02 Sep 2025 15:29:32 GMT; Max-Age=3599; HttpOnly; Secure; SameSite=None, DSR=r1.r2.r3; Path=/; Expires=Tue, 02 Sep 2025 15:29:32 GMT; Max-Age=3599; HttpOnly; Secure; SameSite=None, DSTEST=c1; path=/; expires=Tue, 02-Sep-25 14:59:32 GMT; domain=.descope.com; HttpOnly; Secure; SameSite=None';
      expect(getCookieValue(cookie, 'DS')).toBe('s1.s2.s3');
      expect(getCookieValue(cookie, 'DSR')).toBe('r1.r2.r3');
      expect(getCookieValue(cookie, 'DSTEST')).toBe('c1');
      expect(getCookieValue(cookie, 'UNKNOWN')).toBeNull();
    });
  });
});
