import createSdk, { DeliveryMethod } from '@descope/core-js-sdk';

type Head<T extends ReadonlyArray<any>> = T extends readonly [] ? never : T[0];

/** Parsed JWT token */
interface Token {
  sub?: string;
  exp?: number;
  iss?: string;
  [claim: string]: unknown;
}

/** All information regarding token including the raw JWT, parsed JWT and cookies */
export interface AuthenticationInfo {
  jwt: string;
  token: Token;
  cookies?: string[];
}

export interface RefreshAuthenticationInfo extends AuthenticationInfo {
  refreshJwt?: string;
}

/** Options for token verification (extensible). For now only audience. */
export interface VerifyOptions {
  audience?: string | string[];
}

/** Descope core SDK type */
export type CreateCoreSdk = typeof createSdk;
export type CoreSdkConfig = Head<Parameters<CreateCoreSdk>>;
export type DeliveryMethodForTestUser = DeliveryMethod | 'Embedded';
