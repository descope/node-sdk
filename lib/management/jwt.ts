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

const withJWT = (httpClient: HttpClient) => ({
  update: (
    jwt: string,
    customClaims?: Record<string, any>,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(httpClient.post(apiPaths.jwt.update, { jwt, customClaims, refreshDuration })),
  impersonate: (
    impersonatorId: string,
    loginId: string,
    validateConsent: boolean,
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.jwt.impersonate, {
        impersonatorId,
        loginId,
        validateConsent,
        customClaims,
        selectedTenant,
        refreshDuration,
      }),
    ),
  stopImpersonation: (
    jwt: string,
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.jwt.stopImpersonation, {
        jwt,
        customClaims,
        selectedTenant,
        refreshDuration,
      }),
    ),
  signIn: (loginId: string, loginOptions?: MgmtLoginOptions): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(httpClient.post(apiPaths.jwt.signIn, { loginId, ...loginOptions })),
  signUp: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(httpClient.post(apiPaths.jwt.signUp, { loginId, user, ...signUpOptions })),
  signUpOrIn: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.jwt.signUpOrIn, { loginId, user, ...signUpOptions }),
    ),
  anonymous: (
    customClaims?: Record<string, any>,
    selectedTenant?: string,
    refreshDuration?: number,
  ): Promise<SdkResponse<AnonymousJWTResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.jwt.anonymous, { customClaims, selectedTenant, refreshDuration }),
    ),
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
