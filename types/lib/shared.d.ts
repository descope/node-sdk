import { RequestInit, Response } from "node-fetch";
export declare class Logger {
    log(message: string): void;
    error(message: string, error: unknown): void;
    debug(message: string): void;
}
export declare var logger: Logger;
export declare type requestConfig = {
    url: string;
    method: "GET" | "DELETE" | "POST" | "PUT";
    params?: Record<string, string | number>;
    headers?: Record<string, string | number>;
    cookies?: Record<string, string>;
    data?: unknown;
};
export declare class FetchConfig {
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
export declare function request<T>(fetchConfig: FetchConfig, requestConfig: requestConfig): Promise<httpResponse<T>>;
