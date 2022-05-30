import { fetchConfig, DeliveryMethod, User, httpResponse } from "./../shared.js";
import { OTP } from "./otp.js";
import * as jose from "jose";
interface VerifyCodeRequest extends SignInRequest {
    code: string;
}
interface Token {
    sub?: string;
    exp?: number;
    iss?: string;
}
interface SignInRequest {
    method: DeliveryMethod;
    identifier: string;
}
interface SignUpRequest extends SignInRequest {
    user: User;
}
export declare class Auth {
    private fetchConfig;
    otp: OTP;
    keys: Record<string, jose.KeyLike | Uint8Array>;
    constructor(conf: fetchConfig);
    SignInOTP(r: SignInRequest): Promise<httpResponse<void>>;
    SignUpOTP(r: SignUpRequest): Promise<httpResponse<void>>;
    VerifyCode(r: VerifyCodeRequest): Promise<Token | undefined>;
    ValidateSession(sessionToken: string, refreshToken: string): Promise<Token | null>;
    getKey: jose.JWTVerifyGetKey;
}
export {};
