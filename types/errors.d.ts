import { requestConfig } from "./shared";
export declare class RequestError extends Error {
    request: requestConfig;
    constructor(message: string, request: requestConfig);
}
