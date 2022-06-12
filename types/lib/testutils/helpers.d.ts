import nock from 'nock';
import { Config } from '../shared';
export declare class MockAuthConfig extends Config {
    constructor(conf?: Partial<Config>);
    mockGet: (route: string) => nock.Interceptor;
    mockPost: (route: string, bodyCallback?: ((body: any) => void) | undefined, options?: nock.Options | undefined) => nock.Interceptor;
    mockDelete: (route: string) => nock.Interceptor;
}
export declare const getError: <TError extends Error>(call: () => unknown) => Promise<TError>;
