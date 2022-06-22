import {
  IRequestConfig,
  request,
  DeliveryMethod,
  User,
  HttpResponse,
  HTTPMethods,
  Token,
} from '../shared'

export interface IOTP {
  // signUp - Use to create a new user based on the given identifier either email or a phone.
  // choose the selected delivery method for verification.
  // optional to add user metadata for farther user details such as name and more.
  // throws an error upon failure.
  signUp: (method: DeliveryMethod, identifier: string, user?: User) => Promise<HttpResponse<void>>
  // signIn - Use to login a user based on the given identifier
  // and choose the selected delivery method for verification.
  // throws an error upon failure.
  signIn: (method: DeliveryMethod, identifier: string) => Promise<HttpResponse<void>>
  // verifyCode - Use to verify a signIn/signUp based on the given identifier
  // followed by the code used to verify and authenticate the user.
  // returns a Token object describing the granted token including the user authentication JWT.
  // throws an error upon failure.
  verifyCode: (
    method: DeliveryMethod,
    identifier: string,
    code: string,
  ) => Promise<HttpResponse<Token>>
}

export class OTP implements IOTP {
  private requestConfig: IRequestConfig

  constructor(requestConfig: IRequestConfig) {
    this.requestConfig = requestConfig
  }

  signUp(method: DeliveryMethod, identifier: string, user?: User): Promise<HttpResponse<void>> {
    return request(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/signup/otp/${method}`,
      data: { [method]: identifier, user },
    })
  }

  signIn(method: DeliveryMethod, identifier: string): Promise<HttpResponse<void>> {
    return request(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/signin/otp/${method}`,
      data: { externalID: identifier },
    })
  }

  verifyCode(
    method: DeliveryMethod,
    identifier: string,
    code: string,
  ): Promise<HttpResponse<Token>> {
    return request<Token>(this.requestConfig, {
      method: HTTPMethods.post,
      url: `auth/code/verify/${method}`,
      data: { externalID: identifier, code },
    })
  }
}
