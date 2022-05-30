import { RequestInit, Response } from "node-fetch";
export declare type requestConfig = {
    url: string;
    method: "GET" | "DELETE" | "POST" | "PUT";
    params?: Record<string, string | number>;
    headers?: Record<string, string | number>;
    data?: unknown;
};
export declare class fetchConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout: number;
    projectId: string;
    publicKey?: string;
    constructor();
}
export declare class httpResponse<T> {
    request: RequestInit;
    response: Response;
    body?: T;
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
export declare function request<T>(fetchConfig: fetchConfig, requestConfig: requestConfig): Promise<httpResponse<T>>;
