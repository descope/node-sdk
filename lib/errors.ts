import { requestConfig } from './shared';

export class RequestError extends Error {
  request: requestConfig;

  constructor(request: requestConfig, error?: Error, message?: string) {
    super(error?.message || message);
    this.request = request;
  }
}

export class JWTError extends Error {}
