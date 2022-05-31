import { Response } from 'node-fetch';
import * as jose from 'jose';
import { FetchConfig, request, DeliveryMethod, User, httpResponse, logger } from '../shared.js';
import OTP from './otp.js';

interface SignInRequest {
  deliveryMethod: DeliveryMethod;
  identifier: string;
}

interface SignUpRequest extends SignInRequest {
  user: User;
}

interface VerifyCodeRequest {
  deliveryMethod: DeliveryMethod;
  identifier: string;
  code: string;
}

interface Token {
  sub?: string;
  exp?: number;
  iss?: string;
}

interface AuthenticationInfo {
  token?: Token;
  cookies?: string[];
}

export default class Auth {
  private fetchConfig: FetchConfig;

  otp: OTP;

  keys: Record<string, jose.KeyLike | Uint8Array> = {};

  constructor(conf: FetchConfig) {
    this.fetchConfig = { ...new FetchConfig(), ...conf };
    this.otp = new OTP(this.fetchConfig);
  }

  async SignUpOTP(r: SignUpRequest): Promise<httpResponse<void>> {
    return this.otp.signUp(r.deliveryMethod, r.identifier, r.user);
  }

  async SignInOTP(r: SignInRequest): Promise<httpResponse<void>> {
    return this.otp.signIn(r.deliveryMethod, r.identifier);
  }

  async VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo | undefined> {
    const res = await request<Token>(this.fetchConfig, {
      method: 'POST',
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
      const res = await jose.jwtVerify(refreshToken, this.getKey, {
        algorithms: ['ES384'],
      });
      if (res) {
        logger.log('requesting new session token');
        try {
          const httpRes = await request<Token>(this.fetchConfig, {
            method: 'GET',
            url: 'refresh',
            cookies: { DS: sessionToken, DSR: refreshToken },
          });
          return { token: httpRes.body, cookies: this.parseCookies(httpRes.response) };
        } catch (requestErr) {
          logger.error('failed to fetch refresh session token', requestErr);
        }
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
      const publicKeys = await request(
        { ...this.fetchConfig, baseURL: 'http://localhost:8152/v1/' },
        {
          method: 'GET',
          url: `keys/${this.fetchConfig.projectId}`,
        },
      );

      (publicKeys.body as jose.JWK[]).forEach(async (key) => {
        this.keys[key?.kid || ''] = await jose.importJWK(key);
      });
    }

    if (this.keys[currentKid]) {
      return this.keys[currentKid];
    }

    throw Error('failed to fetch matching key');
  };
}
