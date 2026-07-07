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

/** Options for token verification (extensible). For now only audience. */
export interface VerifyOptions {
  audience?: string | string[];
}

/**
 * The kind of Descope app the client credentials belong to. This determines which
 * OAuth2 token endpoint and authentication style is used for the exchange.
 * - `inbound` (default): Inbound Apps / agentic clients (`/oauth2/v1/apps/token`).
 * - `federated`: OIDC Federated Apps (`/oauth2/v1/token`, HTTP Basic auth).
 */
export type ClientCredentialsAppType = 'inbound' | 'federated';

/**
 * Options for exchanging client credentials for a session token via a Descope
 * Inbound App or Federated App (OAuth2 `client_credentials` grant).
 */
export interface ClientCredentialsOptions {
  /** Space-delimited scopes to request (e.g. `"openid email profile"`). */
  scope?: string;
  /** Optional audience for the requested access token. */
  audience?: string;
  /** Optional resource indicator (RFC 8707). */
  resource?: string;
  /** Which kind of Descope app the credentials belong to. Defaults to `'inbound'`. */
  appType?: ClientCredentialsAppType;
}

/** Raw response returned by the Inbound App OAuth2 token endpoint. */
export interface TokenEndpointResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

/** Descope core SDK type */
export type CreateCoreSdk = typeof createSdk;
export type CoreSdkConfig = Head<Parameters<CreateCoreSdk>>;
export type DeliveryMethodForTestUser = DeliveryMethod | 'Embedded';
