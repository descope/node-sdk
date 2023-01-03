import createSdk from '@descope/core-js-sdk';

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

/** Descope core SDK type */
export type CreateCoreSdk = typeof createSdk;
export type CoreSdkConfig = Head<Parameters<CreateCoreSdk>>;
export type CoreSdk = ReturnType<CreateCoreSdk>;
