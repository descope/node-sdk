import { httpResponse } from "./../shared";
import { fetchConfig, request, DeliveryMethod, User } from "../shared.js";

export class OTP {
  private fetchConfig: fetchConfig;

  constructor(fetchConfig: fetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  signIn(
    method: DeliveryMethod,
    identifier: string
  ): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: "POST",
      url: `auth/signin/otp/${method}`,
      data: { [method]: identifier },
    });
  }

  signUp(
    method: DeliveryMethod,
    identifier: string,
    user: User
  ): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: "POST",
      url: `auth/signup/otp/${method}`,
      data: { [method]: identifier, user },
    });
  }
}
