import { ILogger } from './logger';
export declare enum HTTPMethods {
    get = "GET",
    delete = "DELETE",
    post = "POST",
    put = "PUT"
}
export interface Token {
    sub?: string;
    exp?: number;
    iss?: string;
}
export interface IRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    timeoutSeconds?: number;
    projectId: string;
    publicKey?: string;
}
export interface IConfig extends IRequestConfig {
    logger?: ILogger;
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
export declare const HTTPStatusCode: {
    ok: number;
    badRequest: number;
    unauthorized: number;
    forbidden: number;
    notFound: number;
    internalServerError: number;
};
export declare enum OAuthProvider {
    facebook = "facebook",
    github = "github",
    google = "google",
    microsoft = "microsoft",
    gitlab = "gitlab",
    apple = "apple"
}
export declare class Config implements IConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    timeoutSeconds?: number;
    projectId: string;
    publicKey?: string;
    constructor();
    logger: ILogger;
}
