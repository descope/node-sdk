import createSdk, {
  AccessKeyLoginOptions,
  ExchangeAccessKeyResponse,
  SdkResponse,
  wrapWith,
} from '@descope/core-js-sdk';
import { JWK, JWTHeaderParameters, KeyLike, errors, importJWK, jwtVerify } from 'jose';
import {
  permissionsClaimName,
  refreshTokenCookieName,
  rolesClaimName,
  sessionTokenCookieName,
} from './constants';
import fetch from './fetch-polyfill';
import { getAuthorizationClaimItems, isUserAssociatedWithTenant, withCookie } from './helpers';
import withManagement from './management';
import { AuthenticationInfo, RefreshAuthenticationInfo } from './types';
import descopeErrors from './errors';

declare const BUILD_VERSION: string;

/** Configuration arguments which include the Descope core SDK args and an optional management key */
type NodeSdkArgs = Parameters<typeof createSdk>[0] & {
  managementKey?: string;
  publicKey?: string;
};

const nodeSdk = ({ managementKey, publicKey, ...config }: NodeSdkArgs) => {
  const coreSdk = createSdk({
    fetch,
    ...config,
    baseHeaders: {
      ...config.baseHeaders,
      'x-descope-sdk-name': 'nodejs',
      'x-descope-sdk-node-version': process?.versions?.node || '',
      'x-descope-sdk-version': BUILD_VERSION,
    },
  });

  const { projectId, logger } = config;

  const keys: Record<string, KeyLike | Uint8Array> = {};

  /** Fetch the public keys (JWKs) from Descope for the configured project */
  const fetchKeys = async () => {
    if (publicKey) {
      try {
        const parsedKey = JSON.parse(publicKey);
        const key = await importJWK(parsedKey);
        return {
          [parsedKey.kid]: key,
        };
      } catch (e) {
        logger?.error('Failed to parse the provided public key', e);
        throw new Error(`Failed to parse public key. Error: ${e}`);
      }
    }

    const keysWrapper = await coreSdk.httpClient
      .get(`v2/keys/${projectId}`)
      .then((resp) => resp.json());
    const publicKeys: JWK[] = keysWrapper.keys;
    if (!Array.isArray(publicKeys)) return {};
    const kidJwksPairs = await Promise.all(
      publicKeys.map(async (key) => [key.kid, await importJWK(key)]),
    );

    return kidJwksPairs.reduce(
      (acc, [kid, jwk]) => (kid ? { ...acc, [kid.toString()]: jwk } : acc),
      {},
    );
  };

  const management = withManagement(coreSdk, managementKey);

  const sdk = {
    ...coreSdk,

    // Overrides core-sdk refresh, because the core-sdk exposes queryParams, which is for internal use only
    refresh: async (token?: string) => coreSdk.refresh(token),

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
     * Validate an active session
     * @param sessionToken session JWT to validate
     * @returns AuthenticationInfo promise or throws Error if there is an issue with JWTs
     */
    async validateSession(sessionToken: string): Promise<AuthenticationInfo> {
      if (!sessionToken) throw Error('session token is required for validation');

      try {
        const token = await sdk.validateJwt(sessionToken);
        return token;
      } catch (error) {
        /* istanbul ignore next */
        logger?.error('session validation failed', error);
        throw Error(`session validation failed. Error: ${error}`);
      }
    },

    /**
     * Refresh the session using a refresh token
     * @param refreshToken refresh JWT to refresh the session with
     * @returns RefreshAuthenticationInfo promise or throws Error if there is an issue with JWTs
     */
    async refreshSession(refreshToken: string): Promise<RefreshAuthenticationInfo> {
      if (!refreshToken) throw Error('refresh token is required to refresh a session');

      try {
        await sdk.validateJwt(refreshToken);
        const jwtResp = await sdk.refresh(refreshToken);
        if (jwtResp.ok) {
          const token = await sdk.validateJwt(jwtResp.data?.sessionJwt);
          if (jwtResp.data.refreshJwt) {
            // if refresh returned a refresh JWT, add it to the response
            (token as RefreshAuthenticationInfo).refreshJwt = jwtResp.data.refreshJwt;
          }
          return token;
        }
        /* istanbul ignore next */
        throw Error(jwtResp.error?.errorMessage);
      } catch (refreshTokenErr) {
        /* istanbul ignore next */
        logger?.error('refresh token validation failed', refreshTokenErr);
        throw Error(`refresh token validation failed, Error: ${refreshTokenErr}`);
      }
    },

    /**
     * Validate session and refresh it if it expired
     * @param sessionToken session JWT
     * @param refreshToken refresh JWT
     * @returns RefreshAuthenticationInfo promise or throws Error if there is an issue with JWTs
     */
    async validateAndRefreshSession(
      sessionToken?: string,
      refreshToken?: string,
    ): Promise<RefreshAuthenticationInfo> {
      if (!sessionToken && !refreshToken) throw Error('both session and refresh tokens are empty');

      try {
        const token = await sdk.validateSession(sessionToken);
        return token;
      } catch (error) {
        /* istanbul ignore next */
        logger?.log(`session validation failed with error ${error} - trying to refresh it`);
      }

      return sdk.refreshSession(refreshToken);
    },

    /**
     * Exchange API key (access key) for a session key
     * @param accessKey access key to exchange for a session JWT
     * @param loginOptions Optional advanced controls over login parameters
     * @returns AuthenticationInfo with session JWT data
     */
    async exchangeAccessKey(
      accessKey: string,
      loginOptions?: AccessKeyLoginOptions,
    ): Promise<AuthenticationInfo> {
      if (!accessKey) throw Error('access key must not be empty');

      let resp: SdkResponse<ExchangeAccessKeyResponse>;
      try {
        resp = await sdk.accessKey.exchange(accessKey, loginOptions);
      } catch (error) {
        logger?.error('failed to exchange access key', error);
        throw Error(`could not exchange access key - Failed to exchange. Error: ${error}`);
      }

      if (!resp.ok) {
        logger?.error('failed to exchange access key', resp.error);
        throw Error(`could not exchange access key - ${resp.error?.errorMessage}`);
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
        throw Error(`could not exchange access key - failed to validate jwt. Error: ${error}`);
      }
    },

    /**
     * Make sure that all given permissions exist on the parsed JWT top level claims
     * @param authInfo JWT parsed info
     * @param permissions list of permissions to make sure they exist on te JWT claims
     * @returns true if all permissions exist, false otherwise
     */
    validatePermissions(authInfo: AuthenticationInfo, permissions: string[]): boolean {
      return sdk.validateTenantPermissions(authInfo, '', permissions);
    },

    /**
     * Retrieves the permissions from JWT top level claims that match the specified permissions list
     * @param authInfo JWT parsed info containing the permissions
     * @param permissions List of permissions to match against the JWT claims
     * @returns An array of permissions that are both in the JWT claims and the specified list. Returns an empty array if no matches are found
     */
    getMatchedPermissions(authInfo: AuthenticationInfo, permissions: string[]): string[] {
      return sdk.getMatchedTenantPermissions(authInfo, '', permissions);
    },

    /**
     * Make sure that all given permissions exist on the parsed JWT tenant claims
     * @param authInfo JWT parsed info
     * @param tenant tenant to validate the permissions for
     * @param permissions list of permissions to make sure they exist on te JWT claims
     * @returns true if all permissions exist, false otherwise
     */
    validateTenantPermissions(
      authInfo: AuthenticationInfo,
      tenant: string,
      permissions: string[],
    ): boolean {
      // check if user is associated to the tenant
      if (tenant && !isUserAssociatedWithTenant(authInfo, tenant)) return false;

      const granted = getAuthorizationClaimItems(authInfo, permissionsClaimName, tenant);
      return permissions.every((perm) => granted.includes(perm));
    },

    /**
     * Retrieves the permissions from JWT tenant claims that match the specified permissions list
     * @param authInfo JWT parsed info containing the permissions
     * @param tenant tenant to match the permissions for
     * @param permissions List of permissions to match against the JWT claims
     * @returns An array of permissions that are both in the JWT claims and the specified list. Returns an empty array if no matches are found
     * */
    getMatchedTenantPermissions(
      authInfo: AuthenticationInfo,
      tenant: string,
      permissions: string[],
    ): string[] {
      if (tenant && !isUserAssociatedWithTenant(authInfo, tenant)) return [];

      const granted = getAuthorizationClaimItems(authInfo, permissionsClaimName, tenant);
      return permissions.filter((perm) => granted.includes(perm));
    },

    /**
     * Make sure that all given roles exist on the parsed JWT top level claims
     * @param authInfo JWT parsed info
     * @param roles list of roles to make sure they exist on te JWT claims
     * @returns true if all roles exist, false otherwise
     */
    validateRoles(authInfo: AuthenticationInfo, roles: string[]): boolean {
      return sdk.validateTenantRoles(authInfo, '', roles);
    },

    /**
     * Retrieves the roles from JWT top level claims that match the specified roles list
     * @param authInfo JWT parsed info containing the roles
     * @param roles List of roles to match against the JWT claims
     * @returns An array of roles that are both in the JWT claims and the specified list. Returns an empty array if no matches are found
     */
    getMatchedRoles(authInfo: AuthenticationInfo, roles: string[]): string[] {
      return sdk.getMatchedTenantRoles(authInfo, '', roles);
    },

    /**
     * Make sure that all given roles exist on the parsed JWT tenant claims
     * @param authInfo JWT parsed info
     * @param tenant tenant to validate the roles for
     * @param roles list of roles to make sure they exist on te JWT claims
     * @returns true if all roles exist, false otherwise
     */
    validateTenantRoles(authInfo: AuthenticationInfo, tenant: string, roles: string[]): boolean {
      // check if user is associated to the tenant
      if (tenant && !isUserAssociatedWithTenant(authInfo, tenant)) return false;

      const membership = getAuthorizationClaimItems(authInfo, rolesClaimName, tenant);
      return roles.every((role) => membership.includes(role));
    },

    /**
     * Retrieves the roles from JWT tenant claims that match the specified roles list
     * @param authInfo JWT parsed info containing the roles
     * @param tenant tenant to match the roles for
     * @param roles List of roles to match against the JWT claims
     * @returns An array of roles that are both in the JWT claims and the specified list. Returns an empty array if no matches are found
     */
    getMatchedTenantRoles(authInfo: AuthenticationInfo, tenant: string, roles: string[]): string[] {
      if (tenant && !isUserAssociatedWithTenant(authInfo, tenant)) return [];

      const membership = getAuthorizationClaimItems(authInfo, rolesClaimName, tenant);
      return roles.filter((role) => membership.includes(role));
    },
  };

  return wrapWith(
    sdk,
    [
      'otp.verify.email',
      'otp.verify.sms',
      'otp.verify.voice',
      'otp.verify.whatsapp',
      'magicLink.verify',
      'enchantedLink.signUp',
      'enchantedLink.signIn',
      'oauth.exchange',
      'saml.exchange',
      'totp.verify',
      'webauthn.signIn.finish',
      'webauthn.signUp.finish',
      'refresh',
    ] as const,
    withCookie,
  );
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
 * const userLoginId = 'loginId';
 * sdk.otp.signIn.email(userLoginId);
 * const jwtResponse = sdk.otp.verify.email(userLoginId, codeFromEmail);
 * ```
 */

nodeSdk.RefreshTokenCookieName = refreshTokenCookieName;
nodeSdk.SessionTokenCookieName = sessionTokenCookieName;
nodeSdk.DescopeErrors = descopeErrors;

export default nodeSdk;
export type {
  DeliveryMethod,
  JWTResponse,
  OAuthProvider,
  ResponseData,
  SdkResponse,
} from '@descope/core-js-sdk';
export type { AuthenticationInfo };
