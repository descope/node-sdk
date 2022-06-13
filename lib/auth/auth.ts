import { Response } from 'node-fetch';
import { KeyLike, jwtVerify, JWK, JWTHeaderParameters, JWTVerifyGetKey, importJWK } from 'jose';
import { JWTError, RequestError } from '../errors';
import {
  IRequestConfig,
  Config,
  request,
  DeliveryMethod,
  User,
  logger,
  HTTPMethods,
  OAuthProvider,
  LOCATION_HEADER,
} from '../shared';
import OTP from './otp';

const parseCookies = (response: Response): string[] => response.headers?.raw()['set-cookie'];

export interface SignInRequest {
  deliveryMethod: DeliveryMethod;
  identifier: string;
}

export interface SignUpRequest extends SignInRequest {
  user?: User;
}

export interface VerifyCodeRequest {
  deliveryMethod: DeliveryMethod;
  identifier: string;
  code: string;
}

export interface Token {
  sub?: string;
  exp?: number;
  iss?: string;
}

export interface AuthenticationInfo {
  token?: Token;
  cookies?: string[];
}
export class Auth {
  private requestConfig: IRequestConfig;

  private otp: OTP;

  private keys: Record<string, KeyLike | Uint8Array> = {};

  constructor(conf: Config) {
    this.requestConfig = { ...new Config(), ...conf };
    this.otp = new OTP(this.requestConfig);
  }

  async SignUpOTP(r: SignUpRequest): Promise<void> {
    await this.otp.signUp(r.deliveryMethod, r.identifier, r.user);
  }

  async SignInOTP(r: SignInRequest): Promise<void> {
    await this.otp.signIn(r.deliveryMethod, r.identifier);
  }

  async VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo> {
    const res = await request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/code/verify/${r.deliveryMethod}`,
      data: { [r.deliveryMethod]: r.identifier, code: r.code },
    });
    return { token: res.body, cookies: parseCookies(res.response) };
  }

  async Logout(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo> {
    const res = await request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/logoutall`,
      data: { cookies: { DS: sessionToken, DSR: refreshToken } },
    });
    return { cookies: parseCookies(res.response) };
  }

  async StartOAuth(provider: OAuthProvider): Promise<string> {
    const data = {
      method: HTTPMethods.get,
      url: `oauth/authorize`,
      params: { provider },
    };
    const res = await request(this.requestConfig, data);

    const url = res.response.headers?.get(LOCATION_HEADER);
    if (!url) {
      throw new RequestError(data, undefined, `failed to get url from ${LOCATION_HEADER} header`);
    }
    return url;
  }

  async ValidateSession(
    sessionToken: string,
    refreshToken: string,
  ): Promise<AuthenticationInfo | undefined> {
    if (sessionToken === '') throw Error('empty session token');

    try {
      const res = await jwtVerify(sessionToken, this.getKey, {
        algorithms: ['ES384'],
      });
      return { token: res.payload };
    } catch (error) {
      try {
        const res = await jwtVerify(refreshToken, this.getKey, {
          algorithms: ['ES384'],
        });
        if (res) {
          logger.log('requesting new session token');
          try {
            const httpRes = await request<Token>(this.requestConfig, {
              method: HTTPMethods.get,
              url: 'refresh',
              cookies: { DS: sessionToken, DSR: refreshToken },
            });
            return { token: httpRes.body, cookies: parseCookies(httpRes.response) };
          } catch (requestErr) {
            logger.error('failed to fetch refresh session token', requestErr);
            throw new JWTError('could not validate tokens');
          }
        }
      } catch (refreshTokenErr) {
        logger.error('failed to validate refresh token', refreshTokenErr);
        throw new JWTError('could not validate tokens');
      }
    }
    return undefined;
  }

  getKey: JWTVerifyGetKey = async (header: JWTHeaderParameters): Promise<KeyLike | Uint8Array> => {
    const currentKid = header?.kid || '';
    if (!this.keys[currentKid]) {
      const publicKeys = await request<JWK[]>(this.requestConfig, {
        method: HTTPMethods.get,
        url: `keys/${this.requestConfig.projectId}`,
      });

      if (publicKeys.body) {
        await Promise.all(
          publicKeys.body?.map(async (key) => {
            this.keys[key?.kid || ''] = await importJWK(key);
          }),
        );
      }
    }

    if (this.keys[currentKid]) {
      return this.keys[currentKid];
    }

    throw Error('failed to fetch matching key');
  };
}
