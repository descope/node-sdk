export declare type requestConfig = {
    url: string;
    method: "GET" | "DELETE" | "POST" | "PUT";
    params?: Record<string, string | number>;
    data?: unknown;
};
export interface fetchConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout: number;
}
export declare enum DeliveryMethod {
    email = "email",
    SMS = "sms",
    whatsapp = "whatsapp"
}
export interface User {
    username: string;
    name: string;
    email: string;
    phone: string;
}
export declare function request<T>(fetchConfig: fetchConfig, requestConfig: requestConfig): Promise<T>;
