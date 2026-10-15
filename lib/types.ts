import createSdk, { DeliveryMethod } from '@descope/core-js-sdk';

type Head<T extends ReadonlyArray<any>> = T extends readonly [] ? never : T[0];

/** Parsed JWT token */
interface Token {
  sub?: string;
  exp?: number;
  iss?: string;
  [claim: string]: unknown;
}

/** IDP response containing groups, SAML attributes, and OIDC claims from SSO authentication */
export interface IDPResponse {
  idpGroups?: string[];
  idpSAMLAttributes?: Record<string, unknown>;
  idpOIDCClaims?: Record<string, unknown>;
}

/** All information regarding token including the raw JWT, parsed JWT and cookies */
export interface AuthenticationInfo {
  jwt: string;
  token: Token;
  cookies?: string[];
  idpResponse?: IDPResponse;
}

export interface RefreshAuthenticationInfo extends AuthenticationInfo {
  refreshJwt?: string;
}

/** Request details for DPoP enforcement (RFC 9449) */
export interface DPoPRequest {
  /** Value of the request's `DPoP` header */
  proof?: string;
  /** HTTP method, uppercase */
  method: string;
  /** Absolute request URL */
  url: string;
  /** Scheme of the `Authorization` header (`Bearer` or `DPoP`); `DPoP` with an unbound token is rejected */
  authorizationScheme?: string;
}

/** Options for token verification (extensible). */
export interface VerifyOptions {
  audience?: string | string[];
  /** When set, a DPoP-bound session token requires a valid proof for this request */
  dpop?: DPoPRequest;
}

/** Descope core SDK type */
export type CreateCoreSdk = typeof createSdk;
export type CoreSdkConfig = Head<Parameters<CreateCoreSdk>>;
export type DeliveryMethodForTestUser = DeliveryMethod | 'Embedded';
