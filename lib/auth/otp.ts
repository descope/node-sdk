import { httpResponse } from '../shared';
import { FetchConfig, request, DeliveryMethod, User } from '../shared.js';

export default class OTP {
  private fetchConfig: FetchConfig;

  constructor(fetchConfig: FetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: 'POST',
      url: `auth/signin/otp/${method}`,
      data: { [method]: identifier },
    });
  }

  signUp(method: DeliveryMethod, identifier: string, user: User): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: 'POST',
      url: `auth/signup/otp/${method}`,
      data: { [method]: identifier, user },
    });
  }
}
