/** Refresh JWT cookie name */
export const refreshTokenCookieName = 'DSR';
/** Session JWT cookie name */
export const sessionTokenCookieName = 'DS';
/** The key of the tenants claims in the claims map */
export const authorizedTenantsClaimName = 'tenants';
/** The key of the permissions claims in the claims map either under tenant or top level */
export const permissionsClaimName = 'permissions';
/** The key of the roles claims in the claims map either under tenant or top level */
export const rolesClaimName = 'roles';
/** OAuth2 token endpoint for Descope Inbound Apps (used for the client_credentials grant) */
export const inboundAppsTokenPath = '/oauth2/v1/apps/token';
/**
 * Builds the OAuth2 token endpoint path for a Descope Federated App. Each federated
 * app has its own endpoint scoped by its SSO app ID, as published in the app's OIDC
 * discovery document (`/{projectId}/{ssoAppId}/.well-known/openid-configuration`).
 */
export const federatedAppTokenPath = (ssoAppId: string) => `/${ssoAppId}/oauth2/v1/token`;
