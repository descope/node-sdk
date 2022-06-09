import { RequestInit, Response } from 'node-fetch';
export declare class Logger {
    log(message: string): void;
    error(message: string, error?: unknown): void;
    debug(message: string): void;
}
export interface ILogger {
    log(message: string): void;
    error(message: string, error?: unknown): void;
    debug(message: string): void;
}
export declare var logger: ILogger;
export declare enum HTTPMethods {
    get = "GET",
    delete = "DELETE",
    post = "POST",
    put = "PUT"
}
export declare type requestConfig = {
    url: string;
    method: HTTPMethods;
    params?: Record<string, string | number>;
    headers?: Record<string, string | number>;
    cookies?: Record<string, string>;
    data?: unknown;
};
export interface IRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    timeout?: number;
    projectId: string;
    publicKey?: string;
}
export declare class AuthConfig implements IRequestConfig {
    baseURL: string;
    headers: Record<string, string>;
    timeout: number;
    projectId: string;
    publicKey?: string;
    constructor();
    logger?: ILogger;
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
    name?: string;
    email?: string;
    phone?: string;
}
export declare const HTTP_STATUS_CODE: {
    ok: number;
    badRequest: number;
    unauthorized: number;
    forbidden: number;
    notFound: number;
    internalServerError: number;
};
export declare function request<T>(fetchConfig: IRequestConfig, requestConfig: requestConfig): Promise<httpResponse<T>>;
