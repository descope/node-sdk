import { RequestInit, Response } from 'node-fetch';
import { HTTPMethods, IConfig } from './types';
export declare const LOCATION_HEADER = "Location";
export declare type RequestData = {
    url: string;
    method: HTTPMethods;
    params?: Record<string, string | number>;
    headers?: Record<string, string | number>;
    cookies?: Record<string, string>;
    data?: unknown;
};
export declare class HttpResponse<T> {
    request: RequestInit;
    response: Response;
    body?: T;
}
export declare const parseCookies: (response: Response) => string[];
export declare function request<T>(requestConfig: IConfig, requestData: RequestData): Promise<HttpResponse<T>>;
