import {
  IRequestConfig,
  request,
  DeliveryMethod,
  User,
  httpResponse,
  HTTPMethods,
} from '../shared';

export default class OTP {
  private requestConfig: IRequestConfig;

  constructor(requestConfig: IRequestConfig) {
    this.requestConfig = requestConfig;
  }

  signUp(method: DeliveryMethod, identifier: string, user?: User): Promise<httpResponse<void>> {
    return request(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/signup/otp/${method}`,
      data: { [method]: identifier, user },
    });
  }

  signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>> {
    return request(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/signin/otp/${method}`,
      data: { [method]: identifier },
    });
  }
}
