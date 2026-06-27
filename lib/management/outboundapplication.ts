import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  OutboundApplication,
  OutboundAppToken,
  FetchOutboundAppTokenOptions,
  OutboundAppTokenResponse,
  CreateOutboundAppByTemplateOptions,
  OutboundAppUserTokenToUpload,
  OutboundAppTenantTokenToUpload,
  UploadOutboundAppUserTokenRequest,
  UploadOutboundAppTenantTokenRequest,
  BatchUploadOutboundAppTokensResponse,
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
  createApplicationByTemplate: (
    options: CreateOutboundAppByTemplateOptions,
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      httpClient.post(apiPaths.outboundApplication.createByTemplate, {
        ...options,
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
  deleteUserTokens: (appId?: string, userId?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.delete(apiPaths.outboundApplication.deleteUserTokens, {
        queryParams: { appId, userId },
      }),
    ),
  deleteTokenById: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.delete(apiPaths.outboundApplication.deleteTokenById, {
        queryParams: { id },
      }),
    ),
  /**
   * List the IDs of the outbound applications the given user currently holds a valid token for.
   * Replaces calling fetchToken once per app to derive connection status.
   * @param userId the user to look up
   * @param tenantId optional tenant to scope the lookup to
   */
  listAppsWithUserToken: (userId: string, tenantId?: string): Promise<SdkResponse<string[]>> =>
    transformResponse<{ appIds: string[] }, string[]>(
      httpClient.get(apiPaths.outboundApplication.listAppsWithUserToken, {
        queryParams: { userId, ...(tenantId ? { tenantId } : {}) },
      }),
      (data) => data.appIds,
    ),
  /** Upload/set a static API key for a user on an apikey-type outbound application. */
  uploadUserApiKey: (
    appId: string,
    userId: string,
    apiKey: string,
    tenantId?: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.outboundApplication.uploadUserApiKey, {
        appId,
        userId,
        apiKey,
        tenantId,
      }),
    ),
  /** Upload/set a static API key for a tenant on an apikey-type outbound application. */
  uploadTenantApiKey: (
    appId: string,
    tenantId: string,
    apiKey: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.outboundApplication.uploadTenantApiKey, {
        appId,
        tenantId,
        apiKey,
      }),
    ),
  /**
   * Upload (migrate) an existing OAuth token for a user on an oauth-type outbound application,
   * without requiring the user to re-run the OAuth flow.
   */
  uploadUserToken: (token: UploadOutboundAppUserTokenRequest): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.outboundApplication.uploadUserToken, { ...token })),
  /** Upload (migrate) an existing OAuth token for a tenant on an oauth-type outbound application. */
  uploadTenantToken: (token: UploadOutboundAppTenantTokenRequest): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.outboundApplication.uploadTenantToken, { ...token }),
    ),
  /**
   * Batch upload (migrate) existing OAuth tokens for users. All-or-nothing: if any item fails
   * per-item validation, the returned `failures` are populated and no tokens are committed.
   */
  batchUploadUserTokens: (
    tokens: OutboundAppUserTokenToUpload[],
  ): Promise<SdkResponse<BatchUploadOutboundAppTokensResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.outboundApplication.batchUploadUserTokens, { tokens }),
    ),
  /**
   * Batch upload (migrate) existing OAuth tokens for tenants. All-or-nothing: if any item fails
   * per-item validation, the returned `failures` are populated and no tokens are committed.
   */
  batchUploadTenantTokens: (
    tokens: OutboundAppTenantTokenToUpload[],
  ): Promise<SdkResponse<BatchUploadOutboundAppTokensResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.outboundApplication.batchUploadTenantTokens, { tokens }),
    ),
});

export default withOutboundApplication;
