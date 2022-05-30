import { requestConfig } from "./shared.js";
export declare class RequestError extends Error {
    request: requestConfig;
    constructor(message: string, request: requestConfig);
}
