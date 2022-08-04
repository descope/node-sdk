import type { SdkResponse } from '@descope/web-js-sdk'
import { refreshTokenCookieName, sessionTokenCookieName } from './constants'

const generateCookie = (name: string, value: string) => `${name}=${value};`

const getCookieValue = (cookie: string | null | undefined, name: string) => {
  const match = cookie?.match(RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : null
}

// eslint-disable-next-line import/prefer-default-export
export const withCookie =
  <T extends Array<any>, U extends Promise<SdkResponse>>(fn: (...args: T) => U) =>
  async (...args: T): Promise<SdkResponse> => {
    const resp = await fn(...args)

    // eslint-disable-next-line prefer-const
    let [sessionJwt, refreshJwt] = resp.data.jwts
    let cookie = generateCookie(sessionTokenCookieName, sessionJwt)

    if (!refreshJwt) {
      cookie += resp.response?.headers.get('set-cookie') || ''
      refreshJwt = getCookieValue(cookie, refreshTokenCookieName)
    } else {
      cookie += generateCookie(refreshTokenCookieName, refreshJwt)
    }

    return { ...resp, data: { ...resp.data, jwts: [sessionJwt, refreshJwt], cookie } }
  }

export const wrapWith = <T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  wrappingFn: Function,
  // eslint-disable-next-line consistent-return
): void => {
  if (!obj) return obj

  const pathSections = typeof path === 'string' ? path.split('.') : path
  const section = pathSections.shift() || ('' as keyof T)

  if (path.length === 0 || section === '*') {
    const wrap = (key: keyof T) => {
      if (key && typeof obj[key] === 'function') {
        // eslint-disable-next-line no-param-reassign
        obj[key] = wrappingFn(obj[key])
      } else {
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
