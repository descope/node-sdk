import type { ResponseData, SdkResponse } from '@descope/core-js-sdk';
import { AuthenticationInfo } from './types';
import {
  refreshTokenCookieName,
  sessionTokenCookieName,
  authorizedTenantsClaimName,
} from './constants';

/**
 * Generate a cookie string from given parameters
 * @param name name of the cookie
 * @param value value of cookie that must be already encoded
 * @param options any options to put on the cookie like cookieDomain, cookieMaxAge, cookiePath
 * @returns Cookie string with all options on the string
 */
const generateCookie = (name: string, value: string, options?: Record<string, string | number>) =>
  `${name}=${value}; Domain=${options?.cookieDomain || ''}; Max-Age=${options?.cookieMaxAge || ''
  }; Path=${options?.cookiePath || '/'}; HttpOnly; SameSite=Strict`;

/**
 * Parse the cookie string and return the value of the cookie
 * @param cookie the raw cookie string
 * @param name the name of the cookie to get value for
 * @returns the value of the given cookie
 */
const getCookieValue = (cookie: string | null | undefined, name: string) => {
  const match = cookie?.match(RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
};

// eslint-disable-next-line import/prefer-default-export
/**
 * Add cookie generation to core-js functions.
 * @param fn the function we are wrapping
 * @returns Wrapped function with cookie generation
 */
export const withCookie =
  <T extends Array<any>, U extends Promise<SdkResponse<ResponseData>>>(fn: (...args: T) => U) =>
    async (...args: T): Promise<SdkResponse<ResponseData>> => {
      const resp = await fn(...args);

      // istanbul ignore next
      if (!resp.data) {
        return resp;
      }

      // eslint-disable-next-line prefer-const
      let { sessionJwt, refreshJwt, ...rest } = resp.data;
      const cookies = [generateCookie(sessionTokenCookieName, sessionJwt, rest)];

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
 * Wrap given object internal functions (can be deep inside the object) with the given wrapping function
 * @param obj we will deep wrap functions inside this object based on the given path
 * @param path the path of internal objects to walk before wrapping the final result. Path is collection of parts separated by '.' that support '*' to say all of the keys for the part.
 * @param wrappingFn function to wrap with
 * @returns void, we update the functions in place
 */
export const wrapWith = <T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  wrappingFn: Function,
  // eslint-disable-next-line consistent-return
): void => {
  if (!obj) return;

  const pathSections = typeof path === 'string' ? path.split('.') : path;
  const section = pathSections.shift() || ('' as keyof T);

  if (pathSections.length === 0 || section === '*') {
    const wrap = (key: keyof T) => {
      if (key && typeof obj[key] === 'function') {
        // eslint-disable-next-line no-param-reassign
        obj[key] = wrappingFn(obj[key]);
      } else {
        // istanbul ignore next
        throw Error(`cannot wrap value at key "${key.toString()}"`);
      }
    };
    if (section === '*') {
      Object.keys(obj).forEach(wrap);
    } else {
      wrap(section);
    }
  } else {
    wrapWith(obj[section], pathSections, wrappingFn);
  }
};

/**
 * Wrap given object internal functions (can be deep inside the object) with the given wrapping function based on multiple paths.
 * @param obj we will deep wrap functions inside this object based on the given paths
 * @param paths multiple paths of internal objects to walk before wrapping the final result. Path is collection of parts separated by '.' that support '*' to say all of the keys for the part.
 * @param wrappingFn function to wrap with
 * @returns void, we update the functions in place
 */
export const bulkWrapWith = (
  obj: Parameters<typeof wrapWith>[0],
  paths: string[],
  wrappingFn: Parameters<typeof wrapWith>[2],
) => paths.forEach((path: string) => wrapWith(obj, path, wrappingFn));

/**
 * Get the claim (used for permissions or roles) for a given tenant or top level if tenant is empty
 * @param authInfo The parsed authentication info from the JWT
 * @param claim name of the claim
 * @param tenant tenant to retrieve the claim for
 * @returns
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
