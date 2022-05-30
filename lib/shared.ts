import { RequestError } from "./errors.js";
import fetch, { RequestInit, Headers, Response } from "node-fetch";

export type requestConfig = {
  url: string;
  method: "GET" | "DELETE" | "POST" | "PUT";
  params?: Record<string, string | number>;
  headers?: Record<string, string | number>;
  data?: unknown;
};

export class fetchConfig {
  baseURL: string;
  headers: Record<string, string>;
  timeout: number;
  projectId!: string;
  publicKey?: string;

  constructor() {
    this.baseURL = "http://localhost:8191/v1/";
    this.headers = {};
    this.timeout = 60;
  }
}

export class httpResponse<T> {
  request!: RequestInit;
  response!: Response;
  body?: T;
}

export enum DeliveryMethod {
  email = "email",
  SMS = "sms",
  whatsapp = "whatsapp",
}

export interface User {
  username: string;
  name: string;
  email: string;
  phone: string;
}

export async function request<T>(
  fetchConfig: fetchConfig,
  requestConfig: requestConfig
): Promise<httpResponse<T>> {
  const url = new URL(requestConfig.url, fetchConfig.baseURL);
  if (requestConfig.params) {
    Object.entries(requestConfig.params).forEach(([key, value]) =>
      url.searchParams.append(key, String(value))
    );
  }

  const headers = new Headers(fetchConfig.headers);
  if (requestConfig.method === "POST") {
    headers.set("Content-Type", "application/json");
  }

  headers.set("Authorization", "Basic " + btoa(fetchConfig.projectId + ":"));

  let response: Response;
  const options: RequestInit = {
    method: requestConfig.method,
    body: JSON.stringify(requestConfig.data),
    ...fetchConfig,
    headers,
  };
  try {
    console.log(
      `requesting ${url.toString()} with options [${JSON.stringify(options)}]`
    );
    response = await fetch(url.toString(), options);
  } catch (e) {
    const err = e as Error;
    throw new RequestError(err.message, requestConfig);
  }

  let responseJSON;
  try {
    responseJSON = (await response.json()) as T;
  } catch (e) {
    const err = e as Error;
    throw new RequestError(
      `Unable to parse JSON response from server: ${err.message}`,
      requestConfig
    );
  }

  try {
    if (response.status >= 400) {
      throw new RequestError(JSON.stringify(responseJSON), requestConfig);
    }
  } catch (error) {
    console.error(error);
  }

  return { request: options, response, body: responseJSON };
}
