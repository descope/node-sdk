import { SdkResponse } from '@descope/core-js-sdk'
import { JWK, SignJWT, exportJWK, JWTHeaderParameters, generateKeyPair } from 'jose'
import { refreshTokenCookieName, sessionTokenCookieName } from './constants'
import createSdk from '.'

let validToken: string, expiredToken: string, publicKeys: JWK

const logger = {
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}

const sdk = createSdk({
  projectId: 'project-id',
  logger,
})

const get = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc[part], obj) as Function
const generatePathFromKeys = (obj: Record<string, any>, path: string) =>
  Object.keys(get(obj, path)).map((key) => `${path}.${key}`)

describe('sdk', () => {
  beforeAll(async () => {
    const { publicKey, privateKey } = await generateKeyPair('ES384')
    validToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt()
      .setIssuer('project-id')
      .setExpirationTime(1981398111)
      .sign(privateKey)
    expiredToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES384', kid: '0ad99869f2d4e57f3f71c68300ba84fa' })
      .setIssuedAt(1181398100)
      .setIssuer('project-id')
      .setExpirationTime(1181398111)
      .sign(privateKey)
    publicKeys = await exportJWK(publicKey)
    publicKeys.alg = 'ES384'
    publicKeys.kid = '0ad99869f2d4e57f3f71c68300ba84fa'
    publicKeys.use = 'sig'
    jest
      .spyOn(sdk.httpClient, 'get')
      .mockResolvedValue({ json: () => Promise.resolve([publicKeys]) } as Response)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('validateToken', () => {
    it('should return the token payload when valid', async () => {
      const resp = await sdk.validateToken(validToken)
      expect(resp).toMatchObject({
        token: {
          exp: 1981398111,
          iss: 'project-id',
        },
      })
    })

    it('should reject with a proper error message when token expired', async () => {
      await expect(sdk.validateToken(expiredToken)).rejects.toThrow(
        '"exp" claim timestamp check failed',
      )
    })
  })

  describe('getKey', () => {
    it('should throw an error when key does not exist', async () => {
      await expect(sdk.getKey({ kid: 'unknown-key' } as JWTHeaderParameters)).rejects.toThrow(
        'failed to fetch matching key',
      )
    })
    it('should return the key from cache if exists', async () => {
      const newSdk = createSdk({
        projectId: 'project-id',
        logger,
      })

      jest
        .spyOn(newSdk.httpClient, 'get')
        .mockResolvedValue({ json: () => Promise.resolve([publicKeys]) } as Response)

      await newSdk.getKey({ kid: publicKeys.kid } as JWTHeaderParameters)
      await newSdk.getKey({ kid: publicKeys.kid } as JWTHeaderParameters)

      expect(newSdk.httpClient.get).toHaveBeenCalledTimes(1)
    })

    it('should throw an error when kid is empty', async () => {
      await expect(sdk.getKey({ kid: '' } as JWTHeaderParameters)).rejects.toThrow(
        'header.kid must not be empty',
      )
    })
  })

  describe('ValidateSession', () => {
    it('should throw an error when both session and refresh tokens are empty', async () => {
      await expect(sdk.validateSession('', '')).rejects.toThrow(
        'both refresh token and session token are empty',
      )
    })
    it('should return the token when session token is valid', async () => {
      await expect(sdk.validateSession(validToken, '')).resolves.toMatchObject({
        token: { exp: 1981398111, iss: 'project-id' },
      })
    })
    it('should throw an error when both refresh & session tokens expired', async () => {
      await expect(sdk.validateSession(expiredToken, expiredToken)).rejects.toThrow(
        'could not validate tokens',
      )
    })
    it('should refresh session token when it expired and refresh token is valid', async () => {
      const spyRefresh = jest
        .spyOn(sdk, 'refresh')
        .mockResolvedValueOnce({ data: 'data' } as SdkResponse)

      await expect(sdk.validateSession(expiredToken, validToken)).resolves.toEqual('data')
      expect(spyRefresh).toHaveBeenCalledWith(validToken)
    })
    it('should return the token when refresh token is valid', async () => {
      const spyRefresh = jest
        .spyOn(sdk, 'refresh')
        .mockResolvedValueOnce({ data: 'data' } as SdkResponse)

      await expect(sdk.validateSession('', validToken)).resolves.toEqual('data')
      expect(spyRefresh).toHaveBeenCalledWith(validToken)
    })
  })

  describe('withCookies', () => {
    describe('when no cookie', () => {
      const paths = [
        ...generatePathFromKeys(sdk, 'otp.verify'),
        ...generatePathFromKeys(sdk, 'magicLink.crossDevice.signUp'),
        ...generatePathFromKeys(sdk, 'magicLink.crossDevice.signIn'),
        'magicLink.verify',
        'oauth.exchange',
        'saml.exchange',
        'totp.verify',
        'webauthn.signIn.finish',
        'webauthn.signUp.finish',
        'refresh',
      ]

      it.each(paths)('should generate cookie from body jwt for %s', async (path) => {
        const data = { sessionJwt: 'sessionJwt', refreshJwt: 'refreshJwt' }
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
        } as Response)
        jest.spyOn(sdk.httpClient, 'get').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
        } as Response)

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              ...data,
              cookies: [
                `${sessionTokenCookieName}=${data.sessionJwt}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
                `${refreshTokenCookieName}=${data.refreshJwt}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
              ],
            },
          }),
        )
      })

      it.each(paths)('should generate jwt from cookie for %s', async (path) => {
        const data = { sessionJwt: 'sessionJwt' }
        const cookie = `${refreshTokenCookieName}=refreshJwt; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
          headers: new Headers({ 'set-cookie': cookie }),
        } as Response)

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              refreshJwt: 'refreshJwt',
              sessionJwt: 'sessionJwt',
              cookies: [
                `${sessionTokenCookieName}=${data.sessionJwt}; Domain=; Max-Age=; Path=/; HttpOnly; SameSite=Strict`,
                cookie,
              ],
            },
          }),
        )
      })
    })
  })
})
