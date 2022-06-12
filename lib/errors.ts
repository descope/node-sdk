import { requestConfig } from './shared';

export class RequestError extends Error {
  request: requestConfig;

  constructor(request: requestConfig, error?: Error, message?: string) {
    super(error?.message || message);
    this.request = request;
    this.name = error?.name || '';
    this.stack = error?.stack;
  }
}

export interface WebError extends Error {
  code: number;
  details: string[];
  message: string;
}

export class JWTError extends Error {}
