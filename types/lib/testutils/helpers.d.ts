import nock from 'nock';
import { AuthConfig } from '../shared';
export declare class MockAuthConfig extends AuthConfig {
    constructor(conf?: Partial<AuthConfig>);
    mockGet: (route: string) => nock.Interceptor;
    mockPost: (route: string, bodyCallback?: ((body: any) => void) | undefined, options?: nock.Options | undefined) => nock.Interceptor;
    mockDelete: (route: string) => nock.Interceptor;
}
export declare const getError: <TError extends Error>(call: () => unknown) => Promise<TError>;
