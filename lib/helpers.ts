import type { SdkFnWrapper } from '@descope/core-js-sdk';
import { authorizedTenantsClaimName, refreshTokenCookieName } from './constants';
import { AuthenticationInfo } from './types';

/**
 * Generate a cookie string from given parameters
 * @param name name of the cookie
 * @param value value of cookie that must be already encoded
 * @param options any options to put on the cookie like cookieDomain, cookieMaxAge, cookiePath, secureCookie
 * @returns Cookie string with all options on the string
 */
const generateCookie = (
  name: string,
  value: string,
  options?: Record<string, string | number | boolean>,
) => {
  // Secure flag should default to true (secure by default)
  // Allow explicit override for local development via secureCookie option
  // Can be disabled with secureCookie: false or NODE_ENV=development
  const isSecure = options?.secureCookie !== false && process.env.NODE_ENV !== 'development';
  const secureFlag = isSecure ? '; Secure' : '';

  return `${name}=${value}; Domain=${options?.cookieDomain || ''}; Max-Age=${
    options?.cookieMaxAge || ''
  }; Path=${options?.cookiePath || '/'}; HttpOnly; SameSite=Strict${secureFlag}`;
};

/**
 * Parse the cookie string and return the value of the cookie
 * @param cookie the raw cookie string
 * @param name the name of the cookie to get value for
 * @returns the value of the given cookie
 */
export const getCookieValue = (cookie: string | null | undefined, name: string) => {
  const match = cookie?.match(RegExp(`(?:^|[;,]\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
};

/**
 * True if the JWT `iss` claim belongs to the configured Descope project.
 * Accepts a plain project ID, a URL whose last path segment is the project ID,
 * or a URL where the project ID is followed by more path segments (e.g. MCP server tokens).
 */
export function issuerMatchesProject(iss: string | undefined, projectId: string): boolean {
  if (iss === projectId) return true;
  if (!iss || !projectId) return false;

  const isSupportedPosition = (segments: string[]) =>
    segments[segments.length - 1] === projectId || segments[segments.length - 2] === projectId;

  try {
    const { pathname } = new URL(iss);
    const segments = pathname.split('/').filter((segment) => segment.length > 0);
    return isSupportedPosition(segments);
  } catch (_error) {
    // If iss is not a valid URL, support slash-separated issuer formats.
    const segments = iss.split('/').filter((segment) => segment.length > 0);
    return isSupportedPosition(segments);
  }
}

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
