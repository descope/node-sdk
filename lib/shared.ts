import { RequestError, WebError } from './errors';
import fetch, { RequestInit, Headers, Response } from 'node-fetch';

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
  logger = l
}

export enum HTTPMethods {
  get = 'GET',
  delete = 'DELETE',
  post = 'POST',
  put = 'PUT',
}

export type requestConfig = {
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

export class Config implements IRequestConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  projectId!: string;
  publicKey?: string;

  constructor() {
    this.baseURL = 'http://localhost:8191/v1/';
    this.headers = {};
    this.timeout = 60;
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

export const HTTP_STATUS_CODE = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  internalServerError: 500,
};

export async function request<T>(
  fetchConfig: IRequestConfig,
  requestConfig: requestConfig,
): Promise<httpResponse<T>> {
  const url = new URL(requestConfig.url, fetchConfig.baseURL);
  if (requestConfig.params) {
    Object.entries(requestConfig.params).forEach(([key, value]) =>
      url.searchParams.append(key, String(value)),
    );
  }

  const headers = new Headers(fetchConfig.headers);
  if (requestConfig.method === HTTPMethods.post) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Authorization', 'Basic ' + btoa(`${fetchConfig.projectId}:`));

  if (requestConfig.cookies) {
    Object.entries(requestConfig.cookies).forEach((key, value) => {
      headers.append('Cookie', `${key}=${value}`);
    });
  }

  let response: Response;
  const options: RequestInit = {
    method: requestConfig.method,
    body: JSON.stringify(requestConfig.data),
    ...fetchConfig,
    headers,
  };
  try {
    logger.debug(`requesting ${url.toString()} with options [${JSON.stringify(options)}]`);
    response = await fetch(url.toString(), options);
  } catch (e) {
    throw new RequestError(requestConfig, e as Error);
  }

  let tResponse: unknown;
  try {
    tResponse = await response.json();
  } catch (e) {
    const err = e as Error;
    throw new RequestError(requestConfig, err);
  }

  if (response.status >= 400) {
    const webError = tResponse as WebError;
    logger.error(
      `request to ${url.toString()} failed with status ${response.status}: ${webError?.message}`,
    );
    throw webError;
  }

  return { request: options, response, body: tResponse as T };
}
