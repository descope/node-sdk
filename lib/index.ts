import createSdk, {
  SdkResponse,
  ExchangeAccessKeyResponse,
  RequestConfig,
} from '@descope/core-js-sdk';
import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, importJWK, errors } from 'jose';
import fetch, { Headers, Response, Request } from 'node-fetch';
import { bulkWrapWith, withCookie, getAuthorizationClaimItems } from './helpers';
import withManagement from './management';
import { AuthenticationInfo } from './types';
import {
  refreshTokenCookieName,
  sessionTokenCookieName,
  permissionsClaimName,
  rolesClaimName,
} from './constants';

declare const BUILD_VERSION: string;

/* istanbul ignore next */
if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch;
  // @ts-ignore
  globalThis.Headers = Headers;
  // @ts-ignore
  globalThis.Request = Request;
  // @ts-ignore
  globalThis.Response = Response;
}

/** Configuration arguments which include the Descope core SDK args and an optional management key */
type NodeSdkArgs = Parameters<typeof createSdk>[0] & {
  managementKey?: string;
};

const nodeSdk = (args: NodeSdkArgs) => {
  // eslint-disable-next-line no-param-reassign
  args.hooks = args.hooks || {};

  const origBeforeRequest = args.hooks.beforeRequest;
  // eslint-disable-next-line no-param-reassign
  args.hooks.beforeRequest = (config: RequestConfig) => {
    const conf = config;
    conf.headers = {
      ...conf.headers,
      'x-descope-sdk-name': 'nodejs',
      'x-descope-sdk-node-version': process?.versions?.node || '',
      'x-descope-sdk-version': BUILD_VERSION,
    };
    return origBeforeRequest?.(conf) || conf;
  };

  const coreSdk = createSdk(args);

  bulkWrapWith(
    coreSdk,
    [
      'otp.verify.*',
      'magicLink.verify',
      'enchantedLink.signUp.*',
      'enchantedLink.signIn.*',
      'oauth.exchange',
      'saml.exchange',
      'totp.verify',
      'webauthn.signIn.finish',
      'webauthn.signUp.finish',
      'refresh',
    ],
    withCookie,
  );

  const { projectId, logger } = args;

  const keys: Record<string, KeyLike | Uint8Array> = {};

  /** Fetch the public keys (JWKs) from Descope for the configured project */
  const fetchKeys = async () => {
    const publicKeys: JWK[] = await coreSdk.httpClient
      .get(`v1/keys/${projectId}`)
      .then((resp) => resp.json());
    if (!Array.isArray(publicKeys)) return {};
    const kidJwksPairs = await Promise.all(
      publicKeys.map(async (key) => [key.kid, await importJWK(key)]),
    );

    return kidJwksPairs.reduce(
      (acc, [kid, jwk]) => (kid ? { ...acc, [kid.toString()]: jwk } : acc),
      {},
    );
  };

  const management = withManagement(coreSdk, args.managementKey);

  const sdk = {
    ...coreSdk,

    /**
     * Provides various APIs for managing a Descope project programmatically. A management key must
     * be provided as an argument when initializing the SDK to use these APIs. Management keys can be
     * generated in the Descope console.
     */
    management,

    /** Get the key that can validate the given JWT KID in the header. Can retrieve the public key from local cache or from Descope. */
    async getKey(header: JWTHeaderParameters): Promise<KeyLike | Uint8Array> {
      if (!header?.kid) throw Error('header.kid must not be empty');

      if (keys[header.kid]) return keys[header.kid];

      // do we need to fetch once or every time?
      Object.assign(keys, await fetchKeys());

      if (!keys[header.kid]) throw Error('failed to fetch matching key');

      return keys[header.kid];
    },

    /**
     * Validate the given JWT with the right key and make sure the issuer is correct
     * @param jwt the JWT string to parse and validate
     * @returns AuthenticationInfo with the parsed token and JWT. Will throw an error if validation fails.
     */
    async validateJwt(jwt: string): Promise<AuthenticationInfo> {
      // Do not hard-code the algo because library does not support `None` so all are valid
      const res = await jwtVerify(jwt, sdk.getKey, { clockTolerance: 5 });
      const token = res.payload;

      if (token) {
        token.iss = token.iss?.split('/').pop(); // support both url and project id as issuer
        if (token.iss !== projectId) {
          // We must do the verification here, since issuer can be either project ID or URL
          throw new errors.JWTClaimValidationFailed(
            'unexpected "iss" claim value',
            'iss',
            'check_failed',
          );
        }
      }

      return { jwt, token };
    },

    /**
     * Validate session based on at least one of session and refresh JWTs. You must provide at least one of them.
     *
     * @param sessionToken session JWT
     * @param refreshToken refresh JWT
     * @returns AuthenticationInfo promise or throws Error if there is an issue with JWTs
     */
    async validateSession(
      sessionToken?: string,
      refreshToken?: string,
    ): Promise<AuthenticationInfo> {
      if (!sessionToken && !refreshToken)
        throw Error('both refresh token and session token are empty');

      if (sessionToken) {
        try {
          const token = await sdk.validateJwt(sessionToken);
          return token;
        } catch (error) {
          if (!refreshToken) {
            logger?.error('failed to validate session token and no refresh token provided', error);
            throw Error('could not validate tokens');
          }
        }
      }
      if (refreshToken) {
        try {
          await sdk.validateJwt(refreshToken);
          const jwtResp = await sdk.refresh(refreshToken);
          if (jwtResp.ok) {
            const token = await sdk.validateJwt(jwtResp.data?.sessionJwt);
            return token;
          }
          throw Error(jwtResp.error?.message);
        } catch (refreshTokenErr) {
          logger?.error('failed to validate refresh token', refreshTokenErr);
          throw Error('could not validate tokens');
        }
      }
      /* istanbul ignore next */
      throw Error('could not validate token');
    },

    /**
     * Exchange API key (access key) for a session key
     * @param accessKey access key to exchange for a session JWT
     * @returns AuthneticationInfo with session JWT data
     */
    async exchangeAccessKey(accessKey: string): Promise<AuthenticationInfo> {
      if (!accessKey) throw Error('access key must not be empty');

      let resp: SdkResponse<ExchangeAccessKeyResponse>;
      try {
        resp = await sdk.accessKey.exchange(accessKey);
      } catch (error) {
        logger?.error('failed to exchange access key', error);
        throw Error('could not exchange access key');
      }

      const { sessionJwt } = resp.data;
      if (!sessionJwt) {
        logger?.error('failed to parse exchange access key response');
        throw Error('could not exchange access key');
      }

      try {
        const token = await sdk.validateJwt(sessionJwt);
        return token;
      } catch (error) {
        logger?.error('failed to parse jwt from access key', error);
        throw Error('could not exchange access key');
      }
    },

    /**
     * Make sure that all given permissions exist on the parsed JWT top level claims
     * @param authInfo JWT parsed info
     * @param permissions list of permissions to make sure they exist on te JWT claims
     * @returns true if all permissions exist, false otherwise
     */
    validatePermissions(authInfo: AuthenticationInfo, permissions: string[]): boolean {
      return sdk.validateTenantPermissions(authInfo, null, permissions);
    },

    /**
     * Make sure that all given permissions exist on the parsed JWT tenant claims
     * @param authInfo JWT parsed info
     * @param permissions list of permissions to make sure they exist on te JWT claims
     * @returns true if all permissions exist, false otherwise
     */
    validateTenantPermissions(
      authInfo: AuthenticationInfo,
      tenant: string,
      permissions: string[],
    ): boolean {
      const granted = getAuthorizationClaimItems(authInfo, permissionsClaimName, tenant);
      return permissions.every((perm) => granted.includes(perm));
    },

    /**
     * Make sure that all given roles exist on the parsed JWT top level claims
     * @param authInfo JWT parsed info
     * @param roles list of roles to make sure they exist on te JWT claims
     * @returns true if all roles exist, false otherwise
     */
    validateRoles(authInfo: AuthenticationInfo, roles: string[]): boolean {
      return sdk.validateTenantRoles(authInfo, null, roles);
    },

    /**
     * Make sure that all given roles exist on the parsed JWT tenant claims
     * @param authInfo JWT parsed info
     * @param roles list of roles to make sure they exist on te JWT claims
     * @returns true if all roles exist, false otherwise
     */
    validateTenantRoles(authInfo: AuthenticationInfo, tenant: string, roles: string[]): boolean {
      const membership = getAuthorizationClaimItems(authInfo, rolesClaimName, tenant);
      return roles.every((role) => membership.includes(role));
    },
  };

  return sdk;
};

/** Descope SDK client with delivery methods enum.
 *
 * Please see full documentation at {@link https://docs.descope.com/guides Descope Docs}
 * @example Usage
 *
 * ```js
 * import descopeSdk from '@descope/node-sdk';
 *
 * const myProjectId = 'xxx';
 * const sdk = descopeSdk({ projectId: myProjectId });
 *
 * const userIdentifier = 'identifier';
 * sdk.otp.signIn.email(userIdentifier);
 * const jwtResponse = sdk.otp.verify.email(userIdentifier, codeFromEmail);
 * ```
 */
const sdkWithAttributes = nodeSdk as typeof nodeSdk & {
  DeliveryMethods: typeof createSdk.DeliveryMethods;
  RefreshTokenCookieName: typeof refreshTokenCookieName;
  SessionTokenCookieName: typeof sessionTokenCookieName;
};

sdkWithAttributes.DeliveryMethods = createSdk.DeliveryMethods;
sdkWithAttributes.RefreshTokenCookieName = refreshTokenCookieName;
sdkWithAttributes.SessionTokenCookieName = sessionTokenCookieName;

export default sdkWithAttributes;

export type { NodeSdkArgs };

export type { DeliveryMethod, OAuthProvider } from '@descope/core-js-sdk';
