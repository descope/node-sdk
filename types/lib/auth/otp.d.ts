import { IRequestConfig, DeliveryMethod, User, httpResponse } from '../shared';
export default class OTP {
    private requestConfig;
    constructor(requestConfig: IRequestConfig);
    signUp(method: DeliveryMethod, identifier: string, user?: User): Promise<httpResponse<void>>;
    signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>>;
}
