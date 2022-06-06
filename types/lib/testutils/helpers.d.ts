import { AuthConfig } from '../shared';
import nock from 'nock';
export declare class mockAuthConfig extends AuthConfig {
    constructor(conf?: Partial<AuthConfig>);
    mockGet: (route: string) => nock.Interceptor;
    mockPost: (route: string, bodyCallback: (body: any) => void) => nock.Interceptor;
    mockDelete: (route: string) => nock.Interceptor;
}
export declare const getError: <TError extends Error>(call: () => unknown) => Promise<TError>;
