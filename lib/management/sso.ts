import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { RoleMapping, AttributeMapping } from './types';

const withSSOSettings = (sdk: CoreSdk, managementKey?: string) => ({
  configureSettings: (
    tenantId: string,
    idpURL: string,
    idpCert: string,
    entityId: string,
    redirectURL?: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.configure,
        { tenantId, idpURL, entityId, idpCert, redirectURL },
        { token: managementKey },
      ),
    ),
  configureMetadata: (tenantId: string, idpMetadataURL: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.metadata,
        { tenantId, idpMetadataURL },
        { token: managementKey },
      ),
    ),
  configureMapping: (
    tenantId: string,
    roleMapping?: RoleMapping,
    attributeMapping?: AttributeMapping,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.sso.mapping,
        { tenantId, roleMapping, attributeMapping },
        { token: managementKey },
      ),
    ),
});

export default withSSOSettings;
