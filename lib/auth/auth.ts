import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, JWTVerifyGetKey, importJWK } from 'jose'
import DescopeSdk from '@descope/web-js-sdk'
import { MissingArgumentError, JWTError, RequestError } from '../shared/errors'
import { IConfig, Delivery } from '../shared/types'
import {
  IRequestConfig,
  Config,
  request,
  User,
  HTTPMethods,
  OAuthProvider,
  LOCATION_HEADER,
  Token,
  ILogger,
} from '../shared'

function validateDeliveryMethod(deliveryMethod: Delivery) {
  if (!deliveryMethod) throw new MissingArgumentError('deliveryMethod')
}

export interface SignInRequest {
  deliveryMethod: Delivery
  identifier: string
}

export interface SignUpRequest {
  deliveryMethod: Delivery
  identifier: string
  user?: User
}

export interface SignUpMagicLinkRequest extends SignUpRequest {
  URI: string
}

export interface SignInMagicLinkRequest extends SignInRequest {
  URI: string
}

export interface VerifyMagicLinkRequest {
  token: string
}

export interface VerifyCodeRequest {
  deliveryMethod: Delivery
  identifier: string
  code: string
}

export interface AuthenticationInfo {
  token?: Token
  cookies?: string[]
}

export class Auth {
  private requestConfig: IRequestConfig

  private keys: Record<string, KeyLike | Uint8Array> = {}

  private logger?: ILogger

  private sdk

  constructor(conf: IConfig) {
    this.requestConfig = { ...new Config(), ...conf }
    this.logger = conf.logger
    this.sdk = DescopeSdk(conf)
  }

  async SignUpOTP(r: SignUpRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.otp.signUp[r.deliveryMethod](r.identifier, r.user)
  }

  async SignInOTP(r: SignInRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.otp.signUp[r.deliveryMethod](r.identifier)
  }

  async VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo> {
    validateDeliveryMethod(r.deliveryMethod)
    const res = await this.sdk.otp.verify[r.deliveryMethod](r.identifier, r.code)
    return { token: res.data }
  }

  async SignUpMagicLink(r: SignUpMagicLinkRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.magicLink.signUp[r.deliveryMethod](r.identifier, r.URI, r.user)
  }

  async SignInMagicLink(r: SignInMagicLinkRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.magicLink.signIn[r.deliveryMethod](r.identifier, r.URI)
  }

  async SignUpMagicLinkCrossDevice(r: SignUpMagicLinkRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.magicLink.crossDevice.signUp[r.deliveryMethod](r.identifier, r.URI, r.user)
  }

  async SignInMagicLinkCrossDevice(r: SignInMagicLinkRequest): Promise<void> {
    validateDeliveryMethod(r.deliveryMethod)
    await this.sdk.magicLink.crossDevice.signIn[r.deliveryMethod](r.identifier, r.URI)
  }

  async VerifyMagicLink(r: VerifyMagicLinkRequest): Promise<AuthenticationInfo> {
    const res = await this.sdk.magicLink.crossDevice.verify(r.token)
    return { token: res.data }
  }

  async GetMagicLinkSession(ref: string): Promise<AuthenticationInfo> {
    const res = await this.sdk.magicLink.crossDevice.waitForSession(ref)
    return { token: res.data }
  }

  async Logout(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo> {
    await request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/logoutall`,
      data: { cookies: { DS: sessionToken, DSR: refreshToken } },
    })
    return {}
  }

  async StartOAuth(provider: OAuthProvider): Promise<string> {
    const data = {
      method: HTTPMethods.get,
      url: `oauth/authorize`,
      params: { provider },
    }
    const res = await request(this.requestConfig, data)

    const url = res.response.headers?.get(LOCATION_HEADER)
    if (!url) {
      throw new RequestError(data, undefined, `failed to get url from ${LOCATION_HEADER} header`)
    }
    return url
  }

  async ValidateSession(
    sessionToken: string,
    refreshToken: string,
  ): Promise<AuthenticationInfo | undefined> {
    if (sessionToken === '') throw Error('empty session token')

    try {
      return await this.validateToken(sessionToken)
    } catch (error) {
      try {
        const res = await this.validateToken(refreshToken)
        if (res) {
          return this.refreshSessionToken(refreshToken)
        }
      } catch (refreshTokenErr) {
        this.logger?.error('failed to validate refresh token', refreshTokenErr)
        throw new JWTError('could not validate tokens')
      }
    }
    return undefined
  }

  async validateToken(token: string): Promise<AuthenticationInfo> {
    const res = await jwtVerify(token, this.getKey, {
      algorithms: ['ES384'],
    })
    return { token: res.payload }
  }

  async refreshSessionToken(refreshToken: string): Promise<AuthenticationInfo> {
    this.logger?.log('requesting new session token')
    try {
      const httpRes = await request<Token>(this.requestConfig, {
        method: HTTPMethods.get,
        url: 'refresh',
        password: refreshToken,
      })
      return { token: httpRes.body }
    } catch (requestErr) {
      this.logger?.error('failed to fetch refresh session token', requestErr)
      throw new JWTError('could not validate tokens')
    }
  }

  getKey: JWTVerifyGetKey = async (header: JWTHeaderParameters): Promise<KeyLike | Uint8Array> => {
    const currentKid = header?.kid || ''
    if (!this.keys[currentKid]) {
      const publicKeys = await request<JWK[]>(this.requestConfig, {
        method: HTTPMethods.get,
        url: `keys/${this.requestConfig.projectId}`,
      })

      if (publicKeys.body) {
        await Promise.all(
          publicKeys.body?.map(async (key) => {
            this.keys[key?.kid || ''] = await importJWK(key)
          }),
        )
      }
    }

    if (this.keys[currentKid]) {
      return this.keys[currentKid]
    }

    throw Error('failed to fetch matching key')
  }
}
