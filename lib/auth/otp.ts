import { FetchConfig, request, DeliveryMethod, User, httpResponse, HTTPMethods } from '../shared';

export default class OTP {
  private fetchConfig: FetchConfig;

  constructor(fetchConfig: FetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  signUp(method: DeliveryMethod, identifier: string, user?: User): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: HTTPMethods.post,
      url: `auth/signup/otp/${method}`,
      data: { [method]: identifier, user },
    });
  }

  signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>> {
    return request(this.fetchConfig, {
      method: HTTPMethods.post,
      url: `auth/signin/otp/${method}`,
      data: { [method]: identifier },
    });
  }
}
