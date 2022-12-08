import createSdk from '@descope/core-js-sdk';

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
export type CoreSdk = ReturnType<typeof createSdk>;
