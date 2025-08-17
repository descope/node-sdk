import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
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

const withSSOApplication = (httpClient: HttpClient) => ({
  createOidcApplication: (
    options: OidcApplicationOptions,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.ssoApplication.oidcCreate, {
        ...options,
        enabled: options.enabled ?? true,
      }),
    ),
  createSamlApplication: (
    options: SamlApplicationOptions,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.ssoApplication.samlCreate, {
        ...options,
        enabled: options.enabled ?? true,
      }),
    ),
  updateOidcApplication: (
    options: OidcApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.ssoApplication.oidcUpdate, { ...options })),
  updateSamlApplication: (
    options: SamlApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.ssoApplication.samlUpdate, { ...options })),
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.ssoApplication.delete, { id })),
  load: (id: string): Promise<SdkResponse<SSOApplication>> =>
    transformResponse<SSOApplication, SSOApplication>(
      httpClient.get(apiPaths.ssoApplication.load, {
        queryParams: { id },
      }),
      (data) => data,
    ),
  loadAll: (): Promise<SdkResponse<SSOApplication[]>> =>
    transformResponse<MultipleSSOApplicationResponse, SSOApplication[]>(
      httpClient.get(apiPaths.ssoApplication.loadAll, {}),
      (data) => data.apps,
    ),
});

export default withSSOApplication;
