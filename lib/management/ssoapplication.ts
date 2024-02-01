import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  CreateSSOApplicationResponse,
  SSOApplication,
  OidcApplicationOptions,
  SamlApplicationOptions,
} from './types';

type MultipleSSOApplicationResponse = {
  apps: SSOApplication[];
};

const withSSOApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createOidcApplication: (
    options: OidcApplicationOptions,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.oidcCreate,
        {
          ...options,
          enabled: options.enabled ?? true,
        },
        { token: managementKey },
      ),
    ),
  createSamlApplication: (
    options: SamlApplicationOptions,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.samlCreate,
        {
          ...options,
          enabled: options.enabled ?? true,
        },
        { token: managementKey },
      ),
    ),
  updateOidcApplication: (
    options: OidcApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.oidcUpdate,
        { ...options },
        { token: managementKey },
      ),
    ),
  updateSamlApplication: (
    options: SamlApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.samlUpdate,
        { ...options },
        { token: managementKey },
      ),
    ),
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.ssoApplication.delete, { id }, { token: managementKey }),
    ),
  load: (id: string): Promise<SdkResponse<SSOApplication>> =>
    transformResponse<SSOApplication, SSOApplication>(
      sdk.httpClient.get(apiPaths.ssoApplication.load, {
        queryParams: { id },
        token: managementKey,
      }),
      (data) => data,
    ),
  loadAll: (): Promise<SdkResponse<SSOApplication[]>> =>
    transformResponse<MultipleSSOApplicationResponse, SSOApplication[]>(
      sdk.httpClient.get(apiPaths.ssoApplication.loadAll, {
        token: managementKey,
      }),
      (data) => data.apps,
    ),
});

export default withSSOApplication;
