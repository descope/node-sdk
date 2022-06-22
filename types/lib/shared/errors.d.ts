export declare class RequestError extends Error {
    request: any;
    constructor(request: any, error?: Error, message?: string);
}
export interface ServiceError extends Error {
    code: number;
    details: string[];
    error: string;
}
export declare class JWTError extends Error {
}
export declare class MissingArgumentError extends Error {
    constructor(argument: string);
}
