import { JWTResponse, SdkResponse, ExchangeAccessKeyResponse } from '@descope/core-js-sdk'
import { JWK, SignJWT, exportJWK, JWTHeaderParameters, generateKeyPair } from 'jose'
import createSdk from '.'
import { AuthenticationInfo } from './types'
import {
  refreshTokenCookieName,
  sessionTokenCookieName,
  authorizedTenantsClaimName,
  permissionsClaimName,
  rolesClaimName,
} from './constants'

let validToken: string
let expiredToken: string
let publicKeys: JWK
let permAuthInfo: AuthenticationInfo
let permTenantAuthInfo: AuthenticationInfo

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
    permAuthInfo = {
      jwt: 'jwt',
      token: { [permissionsClaimName]: ['foo', 'bar'], [rolesClaimName]: ['abc', 'xyz'] },
    }
    permTenantAuthInfo = {
      jwt: 'jwt',
      token: {
        [authorizedTenantsClaimName]: {
          kuku: { [permissionsClaimName]: ['foo', 'bar'], [rolesClaimName]: ['abc', 'xyz'] },
        },
      },
    }
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
      const resp = await sdk.validateJwt(validToken)
      expect(resp).toMatchObject({
        token: {
          exp: 1981398111,
          iss: 'project-id',
        },
      })
    })

    it('should reject with a proper error message when token expired', async () => {
      await expect(sdk.validateJwt(expiredToken)).rejects.toThrow(
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
    it('should throw an error when session token expired and no refresh token', async () => {
      await expect(sdk.validateSession(expiredToken, '')).rejects.toThrow(
        'could not validate tokens',
      )
    })
    it('should throw an error when both refresh & session tokens expired', async () => {
      await expect(sdk.validateSession(expiredToken, expiredToken)).rejects.toThrow(
        'could not validate tokens',
      )
    })
    it('should refresh session token when it expired and refresh token is valid', async () => {
      const spyRefresh = jest
        .spyOn(sdk, 'refresh')
        .mockResolvedValueOnce({
          ok: true,
          data: { sessionJwt: validToken },
        } as SdkResponse<JWTResponse>)

      await expect(sdk.validateSession(expiredToken, validToken)).resolves.toHaveProperty(
        'jwt',
        validToken,
      )
      expect(spyRefresh).toHaveBeenCalledWith(validToken)
    })
    it('should return the token when refresh token is valid', async () => {
      const spyRefresh = jest
        .spyOn(sdk, 'refresh')
        .mockResolvedValueOnce({
          ok: true,
          data: { sessionJwt: validToken },
        } as SdkResponse<JWTResponse>)

      await expect(sdk.validateSession('', validToken)).resolves.toHaveProperty('jwt', validToken)
      expect(spyRefresh).toHaveBeenCalledWith(validToken)
    })
  })

  describe('exchangeAccessKey', () => {
    it('should fail when the server call throws', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockRejectedValueOnce('error')
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key')
      expect(spyExchange).toHaveBeenCalledWith('key')
    })
    it('should fail when getting an unexpected response from the server', async () => {
      const spyExchange = jest
        .spyOn(sdk.accessKey, 'exchange')
        .mockResolvedValueOnce({ data: {} } as SdkResponse<ExchangeAccessKeyResponse>)
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key')
      expect(spyExchange).toHaveBeenCalledWith('key')
    })
    it('should fail when the session token the server returns is invalid', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        data: { sessionJwt: expiredToken },
      } as SdkResponse<ExchangeAccessKeyResponse>)
      await expect(sdk.exchangeAccessKey('key')).rejects.toThrow('could not exchange access key')
      expect(spyExchange).toHaveBeenCalledWith('key')
    })
    it('should return the same session token it got from the server', async () => {
      const spyExchange = jest.spyOn(sdk.accessKey, 'exchange').mockResolvedValueOnce({
        data: { sessionJwt: validToken },
      } as SdkResponse<ExchangeAccessKeyResponse>)
      const expected: AuthenticationInfo = {
        jwt: validToken,
        token: { exp: 1981398111, iss: 'project-id' },
      }
      await expect(sdk.exchangeAccessKey('key')).resolves.toMatchObject(expected)
      expect(spyExchange).toHaveBeenCalledWith('key')
    })
  })

  describe('validatePermissionsRoles', () => {
    it('should always succeed with empty requirements', () => {
      expect(sdk.validatePermissions(permAuthInfo, [])).toStrictEqual(true)
      expect(sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', [])).toStrictEqual(true)
      expect(sdk.validateRoles(permAuthInfo, [])).toStrictEqual(true)
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', [])).toStrictEqual(true)
    })
    it('should succeed when requirements are met', () => {
      expect(sdk.validatePermissions(permAuthInfo, ['foo'])).toStrictEqual(true)
      expect(
        sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', ['foo', 'bar']),
      ).toStrictEqual(true)
      expect(sdk.validateRoles(permAuthInfo, ['abc'])).toStrictEqual(true)
      expect(sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', ['abc', 'xyz'])).toStrictEqual(
        true,
      )
    })
    it('should fail when wrong function is used', () => {
      expect(sdk.validatePermissions(permTenantAuthInfo, ['foo'])).toStrictEqual(false)
      expect(sdk.validateTenantPermissions(permAuthInfo, 'kuku', ['foo'])).toStrictEqual(false)
      expect(sdk.validateRoles(permTenantAuthInfo, ['abc'])).toStrictEqual(false)
      expect(sdk.validateTenantRoles(permAuthInfo, 'kuku', ['abc'])).toStrictEqual(false)
    })
    it('should fail when requirements are not met', () => {
      expect(sdk.validatePermissions(permAuthInfo, ['foo', 'bar', 'qux'])).toStrictEqual(false)
      expect(
        sdk.validateTenantPermissions(permTenantAuthInfo, 'kuku', ['foo', 'bar', 'qux']),
      ).toStrictEqual(false)
      expect(sdk.validateRoles(permAuthInfo, ['abc', 'xyz', 'tuv'])).toStrictEqual(false)
      expect(
        sdk.validateTenantRoles(permTenantAuthInfo, 'kuku', ['abc', 'xyz', 'tuv']),
      ).toStrictEqual(false)
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
