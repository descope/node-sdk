import createSdk from '@descope/core-js-sdk'
import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, importJWK } from 'jose'
import fetch, { Headers, Response, Request } from 'node-fetch'
import { bulkWrapWith, withCookie } from './helpers'
import { AuthenticationInfo } from './types'
import { refreshTokenCookieName, sessionTokenCookieName } from './constants'

if (!globalThis.fetch) {
  // @ts-ignore
  globalThis.fetch = fetch
  // @ts-ignore
  globalThis.Headers = Headers
  // @ts-ignore
  globalThis.Request = Request
  // @ts-ignore
  globalThis.Response = Response
}

const sdk = (...args: Parameters<typeof createSdk>) => {
  const coreSdk = createSdk(...args)

  bulkWrapWith(
    coreSdk,
    [
      'otp.verify.*',
      'magicLink.verify',
      'magicLink.crossDevice.signUp.*',
      'magicLink.crossDevice.signIn.*',
      'oauth.exchange',
      'saml.exchange',
      'totp.verify',
      'webauthn.signIn.finish',
      'webauthn.signUp.finish',
      'refresh',
    ],
    withCookie,
  )

  const { projectId, logger } = args[0]

  const keys: Record<string, KeyLike | Uint8Array> = {}

  const fetchKeys = async () => {
    const publicKeys: JWK[] = await coreSdk.httpClient
      .get(`v1/keys/${projectId}`)
      .then((resp) => resp.json())
    if (!Array.isArray(publicKeys)) return {}
    const kidJwksPairs = await Promise.all(
      publicKeys.map(async (key) => [key.kid, await importJWK(key)]),
    )

    return kidJwksPairs.reduce(
      (acc, [kid, jwk]) => (kid ? { ...acc, [kid.toString()]: jwk } : acc),
      {},
    )
  }

  return {
    ...coreSdk,

    async getKey(header: JWTHeaderParameters): Promise<KeyLike | Uint8Array> {
      if (!header?.kid) throw Error('header.kid must not be empty')

      if (keys[header.kid]) return keys[header.kid]

      // do we need to fetch once or every time?
      Object.assign(keys, await fetchKeys())

      if (!keys[header.kid]) throw Error('failed to fetch matching key')

      return keys[header.kid]
    },

    async validateToken(token: string): Promise<AuthenticationInfo> {
      const res = await jwtVerify(token, this.getKey, { algorithms: ['ES384'] })

      return { token: res.payload }
    },

    async validateSession(
      sessionToken: string,
      refreshToken: string,
    ): Promise<AuthenticationInfo | undefined> {
      if (!sessionToken && !refreshToken)
        throw Error('both refresh token and session token are empty')

      if (sessionToken) {
        try {
          const token = await this.validateToken(sessionToken)
          return token
        } catch (error) {
          if (refreshToken) {
            try {
              await this.validateToken(refreshToken)
              return (await this.refresh(refreshToken)).data
            } catch (refreshTokenErr) {
              logger?.error('failed to validate refresh token', refreshTokenErr)
              throw Error('could not validate tokens')
            }
          }
          logger?.error('failed to validate session token and no refresh token provided', error)
          throw Error('could not validate tokens')
        }
      }
      // We are here so sessionToken was not provided
      try {
        await this.validateToken(refreshToken)
        return (await this.refresh(refreshToken)).data
      } catch (refreshTokenErr) {
        logger?.error('failed to validate refresh token', refreshTokenErr)
        throw Error('could not validate tokens')
      }
    },
  }
}

const sdkWithAttributes = sdk as typeof sdk & {
  DeliveryMethods: typeof createSdk.DeliveryMethods
  RefreshTokenCookieName: typeof refreshTokenCookieName
  SessionTokenCookieName: typeof sessionTokenCookieName
}

sdkWithAttributes.DeliveryMethods = createSdk.DeliveryMethods
sdkWithAttributes.RefreshTokenCookieName = refreshTokenCookieName
sdkWithAttributes.SessionTokenCookieName = sessionTokenCookieName

export default sdkWithAttributes

export type { DeliveryMethod, OAuthProvider } from '@descope/core-js-sdk'
