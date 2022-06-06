import { requestConfig } from './shared';
export declare class RequestError extends Error {
    request: requestConfig;
    constructor(request: requestConfig, error?: Error, message?: string);
}
