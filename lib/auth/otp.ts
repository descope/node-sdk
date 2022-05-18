import { fetchConfig, request, DeliveryMethod, User } from "../shared";

export class OTP {
  private fetchConfig: fetchConfig;

  constructor(fetchConfig: fetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  signIn(method: DeliveryMethod, identifier: string) {
    return request(this.fetchConfig, {
      method: "POST",
      url: `signin/otp/${method}`,
      data: { [method]: identifier },
    });
  }

  signUp(method: DeliveryMethod, identifier: string, user: User) {
    return request(this.fetchConfig, {
      method: "POST",
      url: `signup/otp/${method}`,
      data: { [method]: identifier, user },
    });
  }
}
