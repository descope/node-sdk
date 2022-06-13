import { requestData } from './shared';
export declare class RequestError extends Error {
    request: requestData;
    constructor(request: requestData, error?: Error, message?: string);
}
export interface WebError extends Error {
    code: number;
    details: string[];
    error: string;
}
export declare class JWTError extends Error {
}
