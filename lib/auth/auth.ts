import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, JWTVerifyGetKey, importJWK } from 'jose'
import { ServerError, JWTError, RequestError } from '../shared/errors'
import { MagicLink } from './magiclink'
import { IConfig } from '../shared/types'
import {
  IRequestConfig,
  Config,
  request,
  DeliveryMethod,
  User,
  HTTPMethods,
  OAuthProvider,
  LOCATION_HEADER,
  parseCookies,
  Token,
  ILogger,
} from '../shared'
import { OTP } from './otp'

export interface SignInRequest {
  deliveryMethod: DeliveryMethod
  identifier: string
}

export interface SignUpRequest {
  deliveryMethod: DeliveryMethod
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
  deliveryMethod: DeliveryMethod
  identifier: string
  code: string
}

export interface AuthenticationInfo {
  token?: Token
  cookies?: string[]
}

export class Auth {
  private requestConfig: IRequestConfig

  private otp: OTP

  magicLink: MagicLink

  private keys: Record<string, KeyLike | Uint8Array> = {}

  private logger?: ILogger

  constructor(conf: IConfig) {
    this.requestConfig = { ...new Config(), ...conf }
    this.logger = conf.logger
    this.otp = new OTP(this.requestConfig)
    this.magicLink = new MagicLink(this.requestConfig)
  }

  async SignUpOTP(r: SignUpRequest): Promise<void> {
    await this.otp.signUp(r.deliveryMethod, r.identifier, r.user)
  }

  async SignInOTP(r: SignInRequest): Promise<void> {
    await this.otp.signIn(r.deliveryMethod, r.identifier)
  }

  async VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo> {
    const res = await this.otp.verifyCode(r.deliveryMethod, r.identifier, r.code)
    return { token: res.body, cookies: parseCookies(res.response) }
  }

  async SignUpMagicLink(r: SignUpMagicLinkRequest): Promise<void> {
    await this.magicLink.signUp(r.deliveryMethod, r.identifier, r.URI, r.user)
  }

  async SignInMagicLink(r: SignInMagicLinkRequest): Promise<void> {
    await this.magicLink.signIn(r.deliveryMethod, r.identifier, r.URI)
  }

  async SignUpMagicLinkCrossDevice(r: SignUpMagicLinkRequest): Promise<void> {
    await this.magicLink.signUpCrossDevice(r.deliveryMethod, r.identifier, r.URI, r.user)
  }

  async SignInMagicLinkCrossDevice(r: SignInMagicLinkRequest): Promise<void> {
    await this.magicLink.signInCrossDevice(r.deliveryMethod, r.identifier, r.URI)
  }

  async VerifyMagicLink(r: VerifyMagicLinkRequest): Promise<AuthenticationInfo> {
    const res = await this.magicLink.verify(r.token)
    return { token: res.body, cookies: parseCookies(res.response) }
  }

  async GetMagicLinkSession(ref: string): Promise<AuthenticationInfo | undefined> {
    try {
      const res = await this.magicLink.getSession(ref)
      return { token: res.body, cookies: parseCookies(res.response) }
    } catch (error) {
      const serverError = error as ServerError
      if (serverError?.status === 401) {
        return undefined
      }
      throw error
    }
  }

  async Logout(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo> {
    const res = await request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/logoutall`,
      data: { cookies: { DS: sessionToken, DSR: refreshToken } },
    })
    return { cookies: parseCookies(res.response) }
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
          return this.refreshSessionToken(sessionToken, refreshToken)
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

  async refreshSessionToken(
    sessionToken: string,
    refreshToken: string,
  ): Promise<AuthenticationInfo> {
    this.logger?.log('requesting new session token')
    try {
      const httpRes = await request<Token>(this.requestConfig, {
        method: HTTPMethods.get,
        url: 'refresh',
        cookies: { DS: sessionToken, DSR: refreshToken },
      })
      return { token: httpRes.body, cookies: parseCookies(httpRes.response) }
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
