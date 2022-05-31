import { httpResponse } from '../shared';
import { FetchConfig, DeliveryMethod, User } from '../shared.js';
export default class OTP {
    private fetchConfig;
    constructor(fetchConfig: FetchConfig);
    signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>>;
    signUp(method: DeliveryMethod, identifier: string, user: User): Promise<httpResponse<void>>;
}
