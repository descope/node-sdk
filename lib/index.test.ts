import { JWTResponse, SdkResponse, ExchangeAccessKeyResponse } from '@descope/core-js-sdk';
import { JWK, SignJWT, exportJWK, JWTHeaderParameters, generateKeyPair } from 'jose';
import createSdk from '.';
import { AuthenticationInfo } from './types';
import {
  refreshTokenCookieName,
  authorizedTenantsClaimName,
  permissionsClaimName,
  rolesClaimName,
} from './constants';

let validToken: string;
let validTokenIssuerURL: string;
let invalidTokenIssuer: string;
let expiredToken: string;
let publicKeys: JWK;
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
    validTokenIssuerURL = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('https://descope.com/bla/project-id')
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

    it('should reject with a proper error message when token issuer invalid', async () => {
      await expect(sdk.validateJwt(invalidTokenIssuer)).rejects.toThrow(
        'unexpected "iss" claim value',
      );
    });

    it('should reject with a proper error message when token expired', async () => {
      await expect(sdk.validateJwt(expiredToken)).rejects.toThrow(
        '"exp" claim timestamp check failed',
      );
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

      await expect(sdk.refreshSession(validToken)).resolves.toHaveProperty('jwt', validToken);
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
      await expect(sdk.validateAndRefreshSession('', validToken)).resolves.toHaveProperty(
        'jwt',
        validToken,
      );
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
      expect(spyExchange).toHaveBeenCalledWith('key');
    });
    it('should fail when getting an unexpected response from the server', async () => {
      const spyExchange = jest
        .spyOn(sdk.accessKey, 'exchange')
        .mockResolvedValueOnce({ data: {} } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key');
      expect(spyExchange).toHaveBeenCalledWith('key');
    });
    it('should fail when the session token the server returns is invalid', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        data: { sessionJwt: expiredToken },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key');
      expect(spyExchange).toHaveBeenCalledWith('key');
    });
    it('should return the same session token it got from the server', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        data: { sessionJwt: validToken },
      } as SdkResponse<ExchangeAccessKeyResponse>);
      const expected: AuthenticationInfo = {
        jwt: validToken,
        token: { exp: 1981398111, iss: 'project-id' },
      };
      await expect(sdk.exchangeAccessKey('key')).resolves.toMatchObject(expected);
      expect(spyExchange).toHaveBeenCalledWith('key');
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

  describe('withCookies', () => {
    describe('when no cookie', () => {
      const paths = [
        ...generatePathFromKeys(sdk, 'otp.verify'),
        ...generatePathFromKeys(sdk, 'enchantedLink.signUp'),
        ...generatePathFromKeys(sdk, 'enchantedLink.signIn'),
        'magicLink.verify',
        'oauth.exchange',
        'saml.exchange',
        'totp.verify',
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
      jest.doMock('@descope/core-js-sdk', () => ({
        __esModule: true,
        default: createCoreJs,
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
});
