import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  RoleMappings,
  AttributeMapping,
  SSOSettingsResponse,
  SSOOIDCSettings,
  SSOSAMLSettings,
  SSOSAMLByMetadataSettings,
  SSOSettings,
} from './types';

function transformSettingsResponse(data) {
  const readySettings = data as any;
  if (readySettings.oidc) {
    readySettings.oidc = {
      ...readySettings.oidc,
      attributeMapping: readySettings.oidc.userAttrMapping,
    };
    delete readySettings.oidc.userAttrMapping;
  }
  if (readySettings.saml?.groupsMapping) {
    readySettings.saml.groupsMapping = readySettings.saml?.groupsMapping.map((gm: any) => {
      const rm = gm;
      rm.roleName = rm.role.name;
      delete rm.role;
      return rm;
    });
  }
  return readySettings;
}

function transformAllSettingsResponse(data) {
  const readySettings = data.SSOSettings as any[];
  const res = [];
  readySettings.forEach((setting) => res.push(transformSettingsResponse(setting)));
  return res;
}

const withSSOSettings = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * @deprecated  Use loadSettings instead
   */
  getSettings: (tenantId: string): Promise<SdkResponse<SSOSettingsResponse>> =>
    transformResponse<SSOSettingsResponse>(
      sdk.httpClient.get(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: managementKey,
      }),
      (data) => data,
    ),
  newSettings: (
    tenantId: string,
    ssoId: string,
    displayName: string,
  ): Promise<SdkResponse<SSOSettings>> =>
    transformResponse<SSOSettings>(
      sdk.httpClient.post(
        apiPaths.sso.settingsNew,
        { tenantId, ...(ssoId ? { ssoId } : {}), displayName },
        { token: managementKey },
      ),
      (data) => transformSettingsResponse(data),
    ),
  deleteSettings: (tenantId: string, ssoId?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.delete(apiPaths.sso.settings, {
        queryParams: { tenantId, ...(ssoId ? { ssoId } : {}) },
        token: managementKey,
      }),
    ),
  /**
   * @deprecated  Use configureSAMLSettings or configureOIDCSettings instead
   */
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
  /**
   * @deprecated  Use configureSAMLByMetadata instead
   */
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
  /**
   * @deprecated  Use configureSAMLSettings, configureSAMLByMetadata or configureOIDCSettings instead
   */
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
  configureOIDCSettings: (
    tenantId: string,
    settings: SSOOIDCSettings,
    domains?: string[],
    ssoId?: string,
  ): Promise<SdkResponse<never>> => {
    const readySettings = { ...settings, userAttrMapping: settings.attributeMapping };
    delete readySettings.attributeMapping;
    return transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.oidc.configure,
        {
          tenantId,
          settings: readySettings,
          domains,
          ...(ssoId ? { ssoId } : {}),
        },
        { token: managementKey },
      ),
    );
  },
  configureSAMLSettings: (
    tenantId: string,
    settings: SSOSAMLSettings,
    redirectUrl?: string,
    domains?: string[],
    ssoId?: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.saml.configure,
        { tenantId, settings, redirectUrl, domains, ...(ssoId ? { ssoId } : {}) },
        { token: managementKey },
      ),
    ),
  configureSAMLByMetadata: (
    tenantId: string,
    settings: SSOSAMLByMetadataSettings,
    redirectUrl?: string,
    domains?: string[],
    ssoId?: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.saml.metadata,
        { tenantId, settings, redirectUrl, domains, ...(ssoId ? { ssoId } : {}) },
        { token: managementKey },
      ),
    ),
  loadSettings: (tenantId: string, ssoId?: string): Promise<SdkResponse<SSOSettings>> =>
    transformResponse<SSOSettings>(
      sdk.httpClient.get(apiPaths.sso.settingsv2, {
        queryParams: { tenantId, ...(ssoId ? { ssoId } : {}) },
        token: managementKey,
      }),
      (data) => transformSettingsResponse(data),
    ),
  loadAllSettings: (tenantId: string): Promise<SdkResponse<SSOSettings[]>> =>
    transformResponse<SSOSettings[]>(
      sdk.httpClient.get(apiPaths.sso.settingsAllV2, {
        queryParams: { tenantId },
        token: managementKey,
      }),
      (data) => transformAllSettingsResponse(data),
    ),
});

export default withSSOSettings;
