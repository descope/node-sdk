import { JWTResponse, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { MgmtLoginOptions, MgmtSignUpOptions, MgmtUserOptions, UpdateJWTResponse } from './types';

type AnonymousJWTResponse = Omit<JWTResponse, 'user' | 'firstSeen'>;

const withJWT = (sdk: CoreSdk, managementKey?: string) => ({
  update: (
    jwt: string,
    customClaims?: Record<string, any>,
    refreshDuration?: number,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.update,
        { jwt, customClaims, refreshDuration },
        { token: managementKey },
      ),
    ),
  impersonate: (
    impersonatorId: string,
    loginId: string,
    validateConsent: boolean,
    customClaims?: Record<string, any>,
    selectedTenant?: string,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.impersonate,
        { impersonatorId, loginId, validateConsent, customClaims, selectedTenant },
        { token: managementKey },
      ),
    ),
  signIn: (loginId: string, loginOptions?: MgmtLoginOptions): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.signIn,
        { loginId, ...loginOptions },
        { token: managementKey },
      ),
    ),
  signUp: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.signUp,
        { loginId, user, ...signUpOptions },
        { token: managementKey },
      ),
    ),
  signUpOrIn: (
    loginId: string,
    user?: MgmtUserOptions,
    signUpOptions?: MgmtSignUpOptions,
  ): Promise<SdkResponse<JWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.signUpOrIn,
        { loginId, user, ...signUpOptions },
        { token: managementKey },
      ),
    ),
  anonymous: (
    customClaims?: Record<string, any>,
    selectedTenant?: string,
  ): Promise<SdkResponse<AnonymousJWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.jwt.anonymous,
        { customClaims, selectedTenant },
        { token: managementKey },
      ),
    ),
});

export default withJWT;
