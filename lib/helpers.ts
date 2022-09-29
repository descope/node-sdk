import type { SdkResponse } from '@descope/core-js-sdk'
import { refreshTokenCookieName, sessionTokenCookieName } from './constants'

const generateCookie = (name: string, value: string, options?: any) =>
  `${name}=${value}; Domain=${options?.cookieDomain || ''}; Max-Age=${
    options?.cookieMaxAge || ''
  }; Path=${options?.cookiePath || '/'}; HttpOnly; SameSite=Strict`

const getCookieValue = (cookie: string | null | undefined, name: string) => {
  const match = cookie?.match(RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : null
}

// eslint-disable-next-line import/prefer-default-export
export const withCookie =
  <T extends Array<any>, U extends Promise<SdkResponse<any>>>(fn: (...args: T) => U) =>
  async (...args: T): Promise<SdkResponse<any>> => {
    const resp = await fn(...args)

    // istanbul ignore next
    if (!resp.data) {
      return resp
    }

    // eslint-disable-next-line prefer-const
    let { sessionJwt, refreshJwt, ...rest } = resp.data
    const cookies = [generateCookie(sessionTokenCookieName, sessionJwt, rest)]

    if (!refreshJwt) {
      if (resp.response?.headers.get('set-cookie')) {
        refreshJwt = getCookieValue(
          resp.response?.headers.get('set-cookie'),
          refreshTokenCookieName,
        )
        cookies.push(resp.response?.headers.get('set-cookie')!)
      }
    } else {
      cookies.push(generateCookie(refreshTokenCookieName, refreshJwt, rest))
    }

    return { ...resp, data: { ...resp.data, refreshJwt, cookies } }
  }

export const wrapWith = <T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  wrappingFn: Function,
  // eslint-disable-next-line consistent-return
): void => {
  if (!obj) return

  const pathSections = typeof path === 'string' ? path.split('.') : path
  const section = pathSections.shift() || ('' as keyof T)

  if (pathSections.length === 0 || section === '*') {
    const wrap = (key: keyof T) => {
      if (key && typeof obj[key] === 'function') {
        // eslint-disable-next-line no-param-reassign
        obj[key] = wrappingFn(obj[key])
      } else {
        // istanbul ignore next
        throw Error(`cannot wrap value at key "${key.toString()}"`)
      }
    }
    if (section === '*') {
      Object.keys(obj).forEach(wrap)
    } else {
      wrap(section)
    }
  } else {
    wrapWith(obj[section], pathSections, wrappingFn)
  }
}

export const bulkWrapWith = (
  obj: Parameters<typeof wrapWith>[0],
  paths: string[],
  wrappingFn: Parameters<typeof wrapWith>[2],
) => paths.forEach((path: string) => wrapWith(obj, path, wrappingFn))
