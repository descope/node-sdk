import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { RoleMappings, AttributeMapping, SSOSettingsResponse } from './types';

const withSSOSettings = (sdk: CoreSdk, managementKey?: string) => ({
  getSettings: (tenantId: string): Promise<SdkResponse<SSOSettingsResponse>> =>
    transformResponse<SSOSettingsResponse>(
      sdk.httpClient.get(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: managementKey,
      }),
      (data) => data,
    ),
  deleteSettings: (tenantId: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.delete(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: managementKey,
      }),
    ),
  configureSettings: (
    tenantId: string,
    idpURL: string,
    idpCert: string,
    entityId: string,
    redirectURL: string,
    domains: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.settings,
        { tenantId, idpURL, entityId, idpCert, redirectURL, domains },
        { token: managementKey },
      ),
    ),
  configureMetadata: (
    tenantId: string,
    idpMetadataURL: string,
    redirectURL: string,
    domains: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.metadata,
        { tenantId, idpMetadataURL, redirectURL, domains },
        { token: managementKey },
      ),
    ),
  configureMapping: (
    tenantId: string,
    roleMappings?: RoleMappings,
    attributeMapping?: AttributeMapping,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.mapping,
        { tenantId, roleMappings, attributeMapping },
        { token: managementKey },
      ),
    ),
});

export default withSSOSettings;
