import { SdkResponse } from '@descope/web-js-sdk'
import { JWTHeaderParameters } from 'jose'
import { refreshTokenCookieName, sessionTokenCookieName } from './constants'
import createSdk from '.'

const validToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCIsImtpZCI6IjBhZDk5ODY5ZjJkNGU1N2YzZjcxYzY4MzAwYmE4NGZhIn0.eyJleHAiOjE5ODEzOTgxMTF9.MHSHryNl0oU3ZBjWc0pFIBKlXHcXU0vcoO3PpRg8MIQ8M14k4sTsUqJfxXCTbxh24YKE6w0XFBh9B4L7vjIY7iVZPM44LXNEzUFyyX3m6eN_iAavGKPKdKnao2ayNeu1'
const expiredToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCIsImtpZCI6IjBhZDk5ODY5ZjJkNGU1N2YzZjcxYzY4MzAwYmE4NGZhIn0.eyJleHAiOjExODEzOTgxMTF9.Qbi7klMrWKSM2z89AtMyDk_lRYnxxz0WApEO5iPikEcAzemmJyR_7b1IvHVxR4uQgCZrH46anUD0aTtPG7k3PpMjP2o2pDHWgY0mWlxW0lDlMqkrvZtBPC7qa_NJTHFl'

const logger = {
  log: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}

const sdk = createSdk({
  projectId: 'project-id',
  logger,
})

const publicKeys = {
  crv: 'P-384',
  d: 'FfTHqwIAM3OMj808FlAL59OkwdXnfmc8FAXtTqyKnfu023kXHtDrAjEwMEBnOC3O',
  key_ops: ['sign'],
  kty: 'EC',
  x: 'c9ZzWUHmgUpCiDMpxaIhPxORaFqMx_HB6DQUmFM0M1GFCdxoaZwAPv2KONgoaRxZ',
  y: 'zTt0paDnsE98Sd7erCVvLWLGGnGcjbOVy5C3m6AI116hUV5JeFAspBe_uDTnAfBD',
  alg: 'ES384',
  use: 'sig',
  kid: '0ad99869f2d4e57f3f71c68300ba84fa',
}

jest
  .spyOn(sdk.httpClient, 'get')
  .mockResolvedValue({ json: () => Promise.resolve([publicKeys]) } as Response)

const get = (obj: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, part) => acc[part], obj) as Function
const generatePathFromKeys = (obj: Record<string, any>, path: string) =>
  Object.keys(get(obj, path)).map((key) => `${path}.${key}`)

describe('sdk', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  describe('validateToken', () => {
    it('should return the token payload when valid', async () => {
      const resp = await sdk.validateToken(validToken)

      expect(resp).toEqual({
        token: {
          exp: 1981398111,
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
    it('should throw an error when session token is empty', async () => {
      await expect(sdk.validateSession('', validToken)).rejects.toThrow(
        'session token must not be empty',
      )
    })
    it('should return the token when session token is valid', async () => {
      await expect(sdk.validateSession(validToken, '')).resolves.toEqual({
        token: { exp: 1981398111 },
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
  })

  describe('withCookies', () => {
    describe('when no cookie', () => {
      const paths = [
        ...generatePathFromKeys(sdk, 'otp.verify'),
        ...generatePathFromKeys(sdk, 'magicLink.crossDevice.signUp'),
        ...generatePathFromKeys(sdk, 'magicLink.crossDevice.signIn'),
        'magicLink.verify',
        'oauth.verify',
      ]

      it.each(paths)('should generate cookie from body jwt for %s', async (path) => {
        const data = { jwts: ['sessionJwt', 'refreshJwt'] }
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
        } as Response)

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              ...data,
              cookie: `${sessionTokenCookieName}=${data.jwts[0]};${refreshTokenCookieName}=${data.jwts[1]};`,
            },
          }),
        )
      })

      it.each(paths)('should generate jwt from cookie for %s', async (path) => {
        const data = { jwts: ['sessionJwt'] }
        const cookie = `${refreshTokenCookieName}=refreshJwt;`
        jest.spyOn(sdk.httpClient, 'post').mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(data),
          headers: new Headers({ 'set-cookie': cookie }),
        } as Response)

        await expect(get(sdk, path)('1', '2', '3')).resolves.toEqual(
          expect.objectContaining({
            data: {
              jwts: [...data.jwts, 'refreshJwt'],
              cookie: `${sessionTokenCookieName}=sessionJwt;${cookie}`,
            },
          }),
        )
      })
    })
  })
})
