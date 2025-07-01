import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
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

const withOutboundApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createApplication: (
    app: WithOptional<OutboundApplication, 'id'> & { clientSecret?: string },
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.create,
        {
          ...app,
        },
        { token: managementKey },
      ),
      (data) => data.app,
    ),
  updateApplication: (
    app: OutboundApplication & { clientSecret?: string },
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.update,
        {
          app,
        },
        { token: managementKey },
      ),
      (data) => data.app,
    ),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.outboundApplication.delete, { id }, { token: managementKey }),
    ),
  loadApplication: (id: string): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.get(`${apiPaths.outboundApplication.load}/${id}`, {
        token: managementKey,
      }),
      (data) => data.app,
    ),
  loadAllApplications: (): Promise<SdkResponse<OutboundApplication[]>> =>
    transformResponse<MultipleOutboundApplicationResponse, OutboundApplication[]>(
      sdk.httpClient.get(apiPaths.outboundApplication.loadAll, {
        token: managementKey,
      }),
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
      sdk.httpClient.post(
        apiPaths.outboundApplication.fetchTokenByScopes,
        {
          appId,
          userId,
          scopes,
          options,
          tenantId,
        },
        { token: managementKey },
      ),
      (data) => data.token,
    ),
  fetchToken: (
    appId: string,
    userId: string,
    tenantId?: string,
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.fetchToken,
        {
          appId,
          userId,
          tenantId,
          options,
        },
        { token: managementKey },
      ),
      (data) => data.token,
    ),
  fetchTenantTokenByScopes: (
    appId: string,
    tenantId: string,
    scopes: string[],
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.fetchTenantTokenByScopes,
        {
          appId,
          tenantId,
          scopes,
          options,
        },
        { token: managementKey },
      ),
      (data) => data.token,
    ),
  fetchTenantToken: (
    appId: string,
    tenantId: string,
    options?: FetchOutboundAppTokenOptions,
  ): Promise<SdkResponse<OutboundAppToken>> =>
    transformResponse<OutboundAppTokenResponse, OutboundAppToken>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.fetchTenantToken,
        {
          appId,
          tenantId,
          options,
        },
        { token: managementKey },
      ),
      (data) => data.token,
    ),
});

export default withOutboundApplication;
