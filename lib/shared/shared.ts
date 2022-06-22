import fetch, { RequestInit, Headers, Response } from 'node-fetch';
import { RequestError, ServiceError } from './errors';
import { HTTPMethods, IConfig } from './types';

export const LOCATION_HEADER = 'Location';

export type RequestData = {
  url: string
  method: HTTPMethods
  params?: Record<string, string | number>
  headers?: Record<string, string | number>
  cookies?: Record<string, string>
  data?: unknown
};

export class HttpResponse<T> {
  request!: RequestInit;

  response!: Response;

  body?: T;
}

export const parseCookies = (response: Response): string[] => response.headers?.raw()['set-cookie'];

export async function request<T>(
  requestConfig: IConfig,
  requestData: RequestData,
): Promise<HttpResponse<T>> {
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

  headers.set('Authorization', `Basic ${btoa(`${requestConfig.projectId}:`)}`);

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
    requestConfig.logger?.debug(
      `requesting ${url.toString()} with options [${JSON.stringify(options)}]`,
    );
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
    const webError = tResponse as ServiceError;
    requestConfig.logger?.error(
      `request to ${url.toString()} failed with status ${response.status}${
        webError?.message ? `: ${webError?.message}` : ''
      }`,
    );
    throw webError;
  }

  return { request: options, response, body: tResponse as T };
}
