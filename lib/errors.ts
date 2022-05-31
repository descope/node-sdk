import { requestConfig } from './shared.js';

export class RequestError extends Error {
  request: requestConfig;

  constructor(message: string, request: requestConfig) {
    super(message);
    this.request = request;
  }
}
