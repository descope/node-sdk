import { fetchConfig, request, DeliveryMethod, User } from "./../shared";
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

export class Auth {
  private fetchConfig: fetchConfig;
  otp: OTP;

  constructor(fetchConfig: fetchConfig) {
    this.fetchConfig = fetchConfig;
    this.otp = new OTP(fetchConfig);
  }

  async SignInOTP(r: SignInRequest): Promise<void> {
    await this.otp.signIn(r.method, r.identifier);
  }
  async SignUpOTP(r: SignUpRequest): Promise<void> {
    await this.otp.signUp(r.method, r.identifier, r.user);
  }
  async VerifyCode(r: VerifyCodeRequest): Promise<void> {
    return request(this.fetchConfig, {
      method: "POST",
      url: `code/verify/${r.method}`,
      data: { [r.method]: r.identifier, code: r.code },
    });
  }
  ValidateSession(token: string): boolean {
    return token === "";
  }
}
