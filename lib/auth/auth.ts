import { Response } from 'node-fetch';
import * as jose from 'jose';
import { JWTError } from 'errors';
import {
  FetchConfig,
  AuthConfig,
  request,
  DeliveryMethod,
  User,
  logger,
  HTTPMethods,
} from '../shared';
import OTP from './otp';

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
  private fetchConfig: FetchConfig;

  otp: OTP;

  keys: Record<string, jose.KeyLike | Uint8Array> = {};

  constructor(conf: AuthConfig) {
    this.fetchConfig = { ...new FetchConfig(), ...conf };
    this.otp = new OTP(this.fetchConfig);
  }

  async SignUpOTP(r: SignUpRequest): Promise<void> {
    await this.otp.signUp(r.deliveryMethod, r.identifier, r.user);
  }

  async SignInOTP(r: SignInRequest): Promise<void> {
    await this.otp.signIn(r.deliveryMethod, r.identifier);
  }

  async VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo | undefined> {
    const res = await request<Token>(this.fetchConfig, {
      method: HTTPMethods.post,
      url: `auth/code/verify/${r.deliveryMethod}`,
      data: { [r.deliveryMethod]: r.identifier, code: r.code },
    });
    return { token: res.body, cookies: this.parseCookies(res.response) };
  }

  async ValidateSession(
    sessionToken: string,
    refreshToken: string,
  ): Promise<AuthenticationInfo | undefined> {
    if (sessionToken === '') throw Error('empty session token');

    try {
      const res = await jose.jwtVerify(sessionToken, this.getKey, {
        algorithms: ['ES384'],
      });
      return { token: res.payload };
    } catch (error) {
      try {
        const res = await jose.jwtVerify(refreshToken, this.getKey, {
          algorithms: ['ES384'],
        });
        if (res) {
          logger.log('requesting new session token');
          try {
            const httpRes = await request<Token>(this.fetchConfig, {
              method: HTTPMethods.get,
              url: 'refresh',
              cookies: { DS: sessionToken, DSR: refreshToken },
            });
            return { token: httpRes.body, cookies: this.parseCookies(httpRes.response) };
          } catch (requestErr) {
            logger.error('failed to fetch refresh session token', requestErr);
          }
        }
      } catch (refreshTokenErr) {
        logger.error('failed to validate refresh token', refreshTokenErr);
        throw new JWTError('could not validate tokens');
      }
    }
    return undefined;
  }

  parseCookies = (response: Response): string[] => response.headers?.raw()['set-cookie'];

  getKey: jose.JWTVerifyGetKey = async (
    header: jose.JWTHeaderParameters,
  ): Promise<jose.KeyLike | Uint8Array> => {
    const currentKid = header?.kid || '';
    if (!this.keys[currentKid]) {
      const publicKeys = await request<jose.JWK[]>(this.fetchConfig, {
        method: HTTPMethods.get,
        url: `keys/${this.fetchConfig.projectId}`,
      });

      if (publicKeys.body) {
        await Promise.all(
          publicKeys.body?.map(async (key) => {
            this.keys[key?.kid || ''] = await jose.importJWK(key);
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
