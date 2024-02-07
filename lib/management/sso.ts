import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { deprecate } from 'util';
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

const withSSOSettings = (sdk: CoreSdk, managementKey?: string) => ({
  getSettings: deprecate(
    (tenantId: string): Promise<SdkResponse<SSOSettingsResponse>> =>
      transformResponse<SSOSettingsResponse>(
        sdk.httpClient.get(apiPaths.sso.settings, {
          queryParams: { tenantId },
          token: managementKey,
        }),
        (data) => data,
      ),
    'getSettings is deprecated, please use loadSettings instead',
  ),
  deleteSettings: (tenantId: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.delete(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: managementKey,
      }),
    ),
  configureSettings: deprecate(
    (
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
    'configureSettings is deprecated, please use configureSAMLSettings instead ',
  ),
  configureMetadata: deprecate(
    (
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
    'configureMetadata is deprecated, please use configureSAMLByMetadata instead',
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
  configureOIDCSettings: (
    tenantId: string,
    settings: SSOOIDCSettings,
    domains?: string[],
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
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.saml.configure,
        { tenantId, settings, redirectUrl, domains },
        { token: managementKey },
      ),
    ),
  configureSAMLByMetadata: (
    tenantId: string,
    settings: SSOSAMLByMetadataSettings,
    redirectUrl?: string,
    domains?: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.saml.metadata,
        { tenantId, settings, redirectUrl, domains },
        { token: managementKey },
      ),
    ),
  loadSettings: (tenantId: string): Promise<SdkResponse<SSOSettings>> =>
    transformResponse<SSOSettings>(
      sdk.httpClient.get(apiPaths.sso.settingsv2, {
        queryParams: { tenantId },
        token: managementKey,
      }),
      (data) => {
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
      },
    ),
});

export default withSSOSettings;
