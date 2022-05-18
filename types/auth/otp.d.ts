import { fetchConfig, DeliveryMethod, User } from "../shared";
export declare class OTP {
    private fetchConfig;
    constructor(fetchConfig: fetchConfig);
    signIn(method: DeliveryMethod, identifier: string): Promise<void>;
    signUp(method: DeliveryMethod, identifier: string, user: User): Promise<void>;
}
