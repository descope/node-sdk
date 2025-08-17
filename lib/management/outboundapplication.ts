import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  OutboundApplication,
  OutboundAppToken,
  FetchOutboundAppTokenOptions,
  OutboundAppTokenResponse,
} from './types';

type OutboundApplicationResponse = {
  app: OutboundApplication;
};

type MultipleOutboundApplicationResponse = {
  apps: OutboundApplication[];
};

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const withOutboundApplication = (httpClient: HttpClient) => ({
  createApplication: (
    app: WithOptional<OutboundApplication, 'id'> & { clientSecret?: string },
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      httpClient.post(apiPaths.outboundApplication.create, {
        ...app,
      }),
      (data) => data.app,
    ),
  updateApplication: (
    app: OutboundApplication & { clientSecret?: string },
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      httpClient.post(apiPaths.outboundApplication.update, {
        app,
      }),
      (data) => data.app,
    ),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.outboundApplication.delete, { id })),
  loadApplication: (id: string): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      httpClient.get(`${apiPaths.outboundApplication.load}/${id}`),
      (data) => data.app,
    ),
  loadAllApplications: (): Promise<SdkResponse<OutboundApplication[]>> =>
    transformResponse<MultipleOutboundApplicationResponse, OutboundApplication[]>(
      httpClient.get(apiPaths.outboundApplication.loadAll, {}),
      (data) => data.apps,
    ),
  fetchTokenByScopes: (
    appId: string,
    userId: string,
    scopes: string[],
    options?: FetchOutboundAppTokenOptions,
    tenantId?: string,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      httpClient.post(apiPaths.outboundApplication.fetchTokenByScopes, {
        appId,
        userId,
        scopes,
        options,
        tenantId,
      }),
      (data) => data.token,
    ),
  fetchToken: (
    appId: string,
    userId: string,
    tenantId?: string,
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      httpClient.post(apiPaths.outboundApplication.fetchToken, {
        appId,
        userId,
        tenantId,
        options,
      }),
      (data) => data.token,
    ),
  fetchTenantTokenByScopes: (
    appId: string,
    tenantId: string,
    scopes: string[],
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      httpClient.post(apiPaths.outboundApplication.fetchTenantTokenByScopes, {
        appId,
        tenantId,
        scopes,
        options,
      }),
      (data) => data.token,
    ),
  fetchTenantToken: (
    appId: string,
    tenantId: string,
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      httpClient.post(apiPaths.outboundApplication.fetchTenantToken, {
        appId,
        tenantId,
        options,
      }),
      (data) => data.token,
    ),
});

export default withOutboundApplication;
