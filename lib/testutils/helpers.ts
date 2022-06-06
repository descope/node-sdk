import nock from 'nock';
import { AuthConfig } from '../shared';

export class MockAuthConfig extends AuthConfig {
  constructor(conf?: Partial<AuthConfig>) {
    super();
    Object.assign(this, conf);
  }

  mockGet = (route: string) => nock(this.baseURL!).get(route);

  mockPost = (route: string, bodyCallback: (body: any) => void) =>
    nock(this.baseURL!).post(route, (body) => {
      bodyCallback(body);
      return true;
    });

  mockDelete = (route: string) => nock(this.baseURL!).delete(route);
}

class NoErrorThrownError extends Error {}

export const getError = async <TError extends Error>(call: () => unknown): Promise<TError> => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error: unknown) {
    return error as TError;
  }
};
