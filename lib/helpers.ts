import type { SdkFnWrapper } from '@descope/core-js-sdk';
import { authorizedTenantsClaimName, refreshTokenCookieName } from './constants';
import { AuthenticationInfo } from './types';

/**
 * Generate a cookie string from given parameters
 * @param name name of the cookie
 * @param value value of cookie that must be already encoded
 * @param options any options to put on the cookie like cookieDomain, cookieMaxAge, cookiePath
 * @returns Cookie string with all options on the string
 */
const generateCookie = (name: string, value: string, options?: Record<string, string | number>) =>
  `${name}=${value}; Domain=${options?.cookieDomain || ''}; Max-Age=${
    options?.cookieMaxAge || ''
  }; Path=${options?.cookiePath || '/'}; HttpOnly; SameSite=Strict`;

/**
 * Parse the cookie string and return the value of the cookie
 * @param cookie the raw cookie string
 * @param name the name of the cookie to get value for
 * @returns the value of the given cookie
 */
export const getCookieValue = (cookie: string | null | undefined, name: string) => {
  const match = cookie?.match(RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
};

// eslint-disable-next-line import/prefer-default-export
/**
 * Add cookie generation to core-js functions.
 * @param fn the function we are wrapping
 * @returns Wrapped function with cookie generation
 */
export const withCookie: SdkFnWrapper<{ refreshJwt?: string; cookies?: string[] }> =
  (fn) =>
  async (...args) => {
    const resp = await fn(...args);

    // istanbul ignore next
    if (!resp.data) {
      return resp;
    }

    // eslint-disable-next-line prefer-const
    let { refreshJwt, ...rest } = resp.data;
    const cookies: string[] = [];

    if (!refreshJwt) {
      if (resp.response?.headers.get('set-cookie')) {
        refreshJwt = getCookieValue(
          resp.response?.headers.get('set-cookie'),
          refreshTokenCookieName,
        );
        cookies.push(resp.response?.headers.get('set-cookie')!);
      }
    } else {
      cookies.push(generateCookie(refreshTokenCookieName, refreshJwt, rest));
    }

    return { ...resp, data: { ...resp.data, refreshJwt, cookies } };
  };

/**
 * Get the claim (used for permissions or roles) for a given tenant or top level if tenant is empty
 * @param authInfo The parsed authentication info from the JWT
 * @param claim name of the claim
 * @param tenant tenant to retrieve the claim for
 * @returns the claim for the given tenant or top level if tenant is empty
 */
export function getAuthorizationClaimItems(
  authInfo: AuthenticationInfo,
  claim: string,
  tenant?: string,
): string[] {
  const value = tenant
    ? authInfo.token[authorizedTenantsClaimName]?.[tenant]?.[claim]
    : authInfo.token[claim];
  return Array.isArray(value) ? value : [];
}

/**
 * Check if the user is associated with the given tenant
 * @param authInfo The parsed authentication info from the JWT
 * @param tenant tenant to check if user is associated with
 * @returns true if user is associated with the tenant
 */
export function isUserAssociatedWithTenant(authInfo: AuthenticationInfo, tenant: string): boolean {
  return !!authInfo.token[authorizedTenantsClaimName]?.[tenant];
}
