import { Response } from 'node-fetch';
import * as jose from 'jose';
import { FetchConfig, DeliveryMethod, User, httpResponse } from '../shared.js';
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
    private fetchConfig;
    otp: OTP;
    keys: Record<string, jose.KeyLike | Uint8Array>;
    constructor(conf: FetchConfig);
    SignUpOTP(r: SignUpRequest): Promise<httpResponse<void>>;
    SignInOTP(r: SignInRequest): Promise<httpResponse<void>>;
    VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo | undefined>;
    ValidateSession(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo | undefined>;
    parseCookies: (response: Response) => string[];
    getKey: jose.JWTVerifyGetKey;
}
export {};
