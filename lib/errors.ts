import { requestData } from './shared';

export class RequestError extends Error {
  request: requestData;

  constructor(request: requestData, error?: Error, message?: string) {
    super(error?.message || message);
    this.request = request;
    this.name = error?.name || '';
    this.stack = error?.stack;
  }
}

export interface WebError extends Error {
  code: number;
  details: string[];
  error: string;
}

export class JWTError extends Error {}

export class ProjectIdMissingError extends Error {
  constructor() {
    super('Project ID is missing');
  }
}
