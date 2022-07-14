import createSdk from '@descope/web-js-sdk'
import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, importJWK } from 'jose'
import { bulkWrapWith, withCookie } from './helpers'
import { AuthenticationInfo } from './types'

export type { DeliveryMethod, OAuthProvider } from '@descope/web-js-sdk'

export default (...args: Parameters<typeof createSdk>) => {
  const sdk = createSdk(...args)

  bulkWrapWith(
    sdk,
    [
      'otp.verify.*',
      'magicLink.verify',
      'magicLink.crossDevice.signUp.*',
      'magicLink.crossDevice.signIn.*',
      'oauth.verify',
      // saml?
      // refresh?
    ],
    withCookie,
  )

  const { projectId, logger } = args[0]

  const keys: Record<string, KeyLike | Uint8Array> = {}

  const fetchKeys = async () => {
    const publicKeys: JWK[] =
      (await sdk.httpClient.get(`keys/${projectId}`).then((resp) => resp.json())) || []
    const kidJwksPairs = await Promise.all(
      publicKeys.map(async (key) => [key.kid, await importJWK(key)]),
    )

    return kidJwksPairs.reduce(
      (acc, [kid, jwk]) => (kid ? { ...acc, [kid.toString()]: jwk } : acc),
      {},
    )
  }

  return {
    ...sdk,

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
      if (!sessionToken) throw Error('session token must not be empty')

      try {
        return await this.validateToken(sessionToken)
      } catch (error) {
        try {
          await this.validateToken(refreshToken)

          return (await this.refresh(refreshToken)).data
        } catch (refreshTokenErr) {
          logger?.error('failed to validate refresh token', refreshTokenErr)

          throw Error('could not validate tokens')
        }
      }
    },
  }
}
