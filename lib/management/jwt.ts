import { JWTResponse, SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  MgmtLoginOptions,
  MgmtSignUpOptions,
  MgmtUserOptions,
  UpdateJWTResponse,
  ClientAssertionResponse,
} from './types';

type AnonymousJWTResponse = Omit<JWTResponse, 'user' | 'firstSeen'>;

/**
 * Validate custom JWT claims to prevent injection attacks
 * @param customClaims The custom claims object to validate
 * @throws Error if validation fails
 */
const validateCustomClaims = (customClaims?: Record<string, any>): void => {
  if (!customClaims) return;

  if (typeof customClaims !== 'object' || Array.isArray(customClaims)) {
    throw new Error('Custom claims must be an object');
  }

  // Prevent overriding standard JWT claims
  const reservedClaims = ['iss', 'sub', 'aud', 'exp', 'nbf', 'iat', 'jti'];
  const invalidClaims = Object.keys(customClaims).filter((key) => reservedClaims.includes(key));

  if (invalidClaims.length > 0) {
    throw new Error(`Cannot override reserved JWT claims: ${invalidClaims.join(', ')}`);
  }

  // Check for excessively large claims that could cause DoS
  let claimsJson: string;
  try {
    claimsJson = JSON.stringify(customClaims);
  } catch {
    throw new Error('Custom claims must be JSON-serializable');
  }
  if (claimsJson.length > 10000) {
    throw new Error('Custom claims exceed maximum size of 10KB');
  }
};

const withJWT = (httpClient: HttpClient) => ({
  update: (
    jwt: string,
    customClaims?: Record<string, any>,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> => {
    validateCustomClaims(customClaims);
    return transformResponse(
      httpClient.post(apiPaths.jwt.update, { jwt, customClaims, refreshDuration }),
    );
  },
  impersonate: (
    impersonatorId: string,
    loginId: string,
    validateConsent: boolean,
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> => {
    validateCustomClaims(customClaims);
    return transformResponse(
      httpClient.post(apiPaths.jwt.impersonate, {
        impersonatorId,
        loginId,
        validateConsent,
        customClaims,
        selectedTenant,
        refreshDuration,
      }),
    );
  },
  stopImpersonation: (
    jwt: string,
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> => {
    validateCustomClaims(customClaims);
    return transformResponse(
      httpClient.post(apiPaths.jwt.stopImpersonation, {
        jwt,
        customClaims,
        selectedTenant,
        refreshDuration,
      }),
    );
  },
  signIn: (loginId: string, loginOptions?: MgmtLoginOptions): Promise<SdkResponse<JWTResponse>> => {
    validateCustomClaims(loginOptions?.customClaims);
    return transformResponse(httpClient.post(apiPaths.jwt.signIn, { loginId, ...loginOptions }));
  },
  signUp: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> => {
    validateCustomClaims(signUpOptions?.customClaims);
    return transformResponse(httpClient.post(apiPaths.jwt.signUp, { loginId, user, ...signUpOptions }));
  },
  signUpOrIn: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> => {
    validateCustomClaims(signUpOptions?.customClaims);
    return transformResponse(
      httpClient.post(apiPaths.jwt.signUpOrIn, { loginId, user, ...signUpOptions }),
    );
  },
  anonymous: (
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<AnonymousJWTResponse>> => {
    validateCustomClaims(customClaims);
    return transformResponse(
      httpClient.post(apiPaths.jwt.anonymous, { customClaims, selectedTenant, refreshDuration }),
    );
  },
  generateClientAssertionJwt: (
    issuer: string,
    subject: string,
    audience: string[],
    expiresIn: number,
    flattenAudience?: boolean,
    algorithm?: 'RS256' | 'RS384' | 'ES384',
  ): Promise<SdkResponse<ClientAssertionResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.jwt.clientAssertion, {
        issuer,
        subject,
        audience,
        expiresIn,
        flattenAudience,
        algorithm,
      }),
    ),
});

export default withJWT;
