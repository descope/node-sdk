import { httpResponse } from "./../shared";
import { fetchConfig, DeliveryMethod, User } from "../shared.js";
export declare class OTP {
    private fetchConfig;
    constructor(fetchConfig: fetchConfig);
    signIn(method: DeliveryMethod, identifier: string): Promise<httpResponse<void>>;
    signUp(method: DeliveryMethod, identifier: string, user: User): Promise<httpResponse<void>>;
}
