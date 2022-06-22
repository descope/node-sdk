/* eslint max-classes-per-file: 0 */
export class RequestError extends Error {
  request: any;

  constructor(request: any, error?: Error, message?: string) {
    super(error?.message || message);
    this.request = request;
    this.name = error?.name || '';
    this.stack = error?.stack;
  }
}

export interface ServiceError extends Error {
  code: number
  details: string[]
  error: string
}

export class JWTError extends Error {}

export class MissingArgumentError extends Error {
  constructor(argument: string) {
    super(`the argument "${argument}" is missing`);
  }
}
