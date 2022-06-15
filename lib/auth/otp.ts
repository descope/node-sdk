import {
  IRequestConfig,
  request,
  DeliveryMethod,
  User,
  httpResponse,
  HTTPMethods,
  Token,
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
      data: { externalID: identifier },
    });
  }

  verifyCode(
    method: DeliveryMethod,
    identifier: string,
    code: string,
  ): Promise<httpResponse<Token>> {
    return request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/code/verify/${method}`,
      data: { externalID: identifier, code },
    });
  }
}
