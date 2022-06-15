import { RequestError, WebError } from './errors';
import fetch, { RequestInit, Headers, Response } from 'node-fetch';

export const LOCATION_HEADER = 'Location';

export class defaultLogger {
  log(message: string): void {
    console.log(message);
  }
  error(message: string, error?: unknown): void {
    console.error(message, error);
  }
  debug(message: string): void {
    console.debug(message);
  }
}

export interface ILogger {
  log(message: string): void;
  error(message: string, error?: unknown): void;
  debug(message: string): void;
}

export var logger: ILogger = new defaultLogger();

export function setLogger(l: ILogger) {
  logger = l;
}

export enum HTTPMethods {
  get = 'GET',
  delete = 'DELETE',
  post = 'POST',
  put = 'PUT',
}

export type requestData = {
  url: string;
  method: HTTPMethods;
  params?: Record<string, string | number>;
  headers?: Record<string, string | number>;
  cookies?: Record<string, string>;
  data?: unknown;
};

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

export class Config implements IRequestConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeoutSeconds?: number;
  projectId!: string;
  publicKey?: string;

  constructor() {
    this.baseURL = 'http://localhost:8191/v1/';
    this.headers = {};
    this.timeoutSeconds = 60;
  }
  logger?: ILogger;
}

export class httpResponse<T> {
  request!: RequestInit;
  response!: Response;
  body?: T;
}

export enum DeliveryMethod {
  email = 'email',
  SMS = 'sms',
  whatsapp = 'whatsapp',
}

export interface User {
  username: string;
  name?: string;
  email?: string;
  phone?: string;
}

export const HTTPStatusCode = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
};

export enum OAuthProvider {
  facebook = 'facebook',
  github = 'github',
  google = 'google',
  microsoft = 'microsoft',
  gitlab = 'gitlab',
  apple = 'apple',
}

export const parseCookies = (response: Response): string[] => response.headers?.raw()['set-cookie'];

export async function request<T>(
  requestConfig: IRequestConfig,
  requestData: requestData,
): Promise<httpResponse<T>> {
  const url = new URL(requestData.url, requestConfig.baseURL);
  if (requestData.params) {
    Object.entries(requestData.params).forEach(([key, value]) =>
      url.searchParams.append(key, String(value)),
    );
  }

  const headers = new Headers(requestConfig.headers);
  if (requestData.method === HTTPMethods.post) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', 'Basic ' + btoa(`${requestConfig.projectId}:`));

  if (requestData.cookies) {
    Object.entries(requestData.cookies).forEach((key, value) => {
      headers.append('Cookie', `${key}=${value}`);
    });
  }

  let response: Response;
  const options: RequestInit = {
    method: requestData.method,
    redirect: 'manual',
    body: JSON.stringify(requestData.data),
    ...requestConfig,
    headers,
    timeout: (requestConfig.timeoutSeconds || 0) * 1000,
  };
  try {
    logger.debug(`requesting ${url.toString()} with options [${JSON.stringify(options)}]`);
    response = await fetch(url.toString(), options);
  } catch (e) {
    throw new RequestError(requestData, e as Error);
  }

  let tResponse: unknown;
  try {
    tResponse = await response.json();
  } catch (e) {
    const err = e as Error;
    throw new RequestError(requestData, err);
  }

  if (response.status >= 400) {
    const webError = tResponse as WebError;
    logger.error(
      `request to ${url.toString()} failed with status ${response.status}${
        webError?.message ? `: ${webError?.message}` : ''
      }`,
    );
    throw webError;
  }

  return { request: options, response, body: tResponse as T };
}
