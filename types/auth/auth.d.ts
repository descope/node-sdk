import { fetchConfig, DeliveryMethod, User } from "./../shared";
import { OTP } from "./otp";
interface VerifyCodeRequest {
    method: DeliveryMethod;
    code: string;
    identifier: string;
}
interface SignInRequest {
    method: DeliveryMethod;
    identifier: string;
}
interface SignUpRequest {
    method: DeliveryMethod;
    identifier: string;
    user: User;
}
export declare class Auth {
    private fetchConfig;
    otp: OTP;
    constructor(fetchConfig: fetchConfig);
    SignInOTP(r: SignInRequest): Promise<void>;
    SignUpOTP(r: SignUpRequest): Promise<void>;
    VerifyCode(r: VerifyCodeRequest): Promise<void>;
    ValidateSession(token: string): boolean;
}
export {};
