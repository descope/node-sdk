import { Response } from 'node-fetch';
import * as jose from 'jose';
import { AuthConfig, DeliveryMethod, User } from '../shared';
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
export declare class Auth {
    private fetchConfig;
    otp: OTP;
    keys: Record<string, jose.KeyLike | Uint8Array>;
    constructor(conf: AuthConfig);
    SignUpOTP(r: SignUpRequest): Promise<void | Error>;
    SignInOTP(r: SignInRequest): Promise<void | Error>;
    VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo | undefined>;
    ValidateSession(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo | undefined>;
    parseCookies: (response: Response) => string[];
    getKey: jose.JWTVerifyGetKey;
}
