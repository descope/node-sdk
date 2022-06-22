import { IRequestConfig, DeliveryMethod, User, HttpResponse, Token } from '../shared';
export interface IOTP {
    signUp: (method: DeliveryMethod, identifier: string, user?: User) => Promise<HttpResponse<void>>;
    signIn: (method: DeliveryMethod, identifier: string) => Promise<HttpResponse<void>>;
    verifyCode: (method: DeliveryMethod, identifier: string, code: string) => Promise<HttpResponse<Token>>;
}
export declare class OTP implements IOTP {
    private requestConfig;
    constructor(requestConfig: IRequestConfig);
    signUp(method: DeliveryMethod, identifier: string, user?: User): Promise<HttpResponse<void>>;
    signIn(method: DeliveryMethod, identifier: string): Promise<HttpResponse<void>>;
    verifyCode(method: DeliveryMethod, identifier: string, code: string): Promise<HttpResponse<Token>>;
}
