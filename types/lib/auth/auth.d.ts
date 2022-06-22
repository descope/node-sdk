import { JWTVerifyGetKey } from 'jose';
import { IConfig } from '../shared/types';
import { DeliveryMethod, User, OAuthProvider, Token } from '../shared';
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
export interface AuthenticationInfo {
    token?: Token;
    cookies?: string[];
}
export declare class Auth {
    private requestConfig;
    private otp;
    private keys;
    private logger?;
    constructor(conf: IConfig);
    SignUpOTP(r: SignUpRequest): Promise<void>;
    SignInOTP(r: SignInRequest): Promise<void>;
    VerifyCode(r: VerifyCodeRequest): Promise<AuthenticationInfo>;
    Logout(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo>;
    StartOAuth(provider: OAuthProvider): Promise<string>;
    ValidateSession(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo | undefined>;
    validateToken(token: string): Promise<AuthenticationInfo>;
    refreshSessionToken(sessionToken: string, refreshToken: string): Promise<AuthenticationInfo>;
    getKey: JWTVerifyGetKey;
}
