import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  CreateSSOApplicationResponse,
  SSOApplication,
  SAMLIDPAttributeMappingInfo,
  SAMLIDPGroupsMappingInfo,
} from './types';

type MultipleSSOApplicationResponse = {
  apps: SSOApplication[];
};

const withSSOApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createOidcApplication: (
    name: string,
    loginPageUrl: string,
    id?: string,
    description?: string,
    logo?: string,
    enabled: boolean = true,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.oidcCreate,
        { name, loginPageUrl, id, description, logo, enabled },
        { token: managementKey },
      ),
    ),
  createSamlApplication: (
    name: string,
    loginPageUrl: string,
    id?: string,
    description?: string,
    logo?: string,
    enabled: boolean = true,
    useMetadataInfo?: boolean,
    metadataUrl?: string,
    entityId?: string,
    acsUrl?: string,
    certificate?: string,
    attributeMapping?: SAMLIDPAttributeMappingInfo[],
    groupsMapping?: SAMLIDPGroupsMappingInfo[],
    acsAllowedCallbacks?: string[],
    subjectNameIdType?: string,
    subjectNameIdFormat?: string,
  ): Promise<SdkResponse<CreateSSOApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.samlCreate,
        {
          name,
          loginPageUrl,
          id,
          description,
          logo,
          enabled,
          useMetadataInfo,
          metadataUrl,
          entityId,
          acsUrl,
          certificate,
          attributeMapping,
          groupsMapping,
          acsAllowedCallbacks,
          subjectNameIdType,
          subjectNameIdFormat,
        },
        { token: managementKey },
      ),
    ),
  updateOidcApplication: (
    id: string,
    name: string,
    loginPageUrl: string,
    description?: string,
    logo?: string,
    enabled?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.oidcUpdate,
        { id, name, loginPageUrl, description, logo, enabled },
        { token: managementKey },
      ),
    ),
  updateSamlApplication: (
    id: string,
    name: string,
    loginPageUrl: string,
    description?: string,
    logo?: string,
    enabled?: boolean,
    useMetadataInfo?: boolean,
    metadataUrl?: string,
    entityId?: string,
    acsUrl?: string,
    certificate?: string,
    attributeMapping?: SAMLIDPAttributeMappingInfo[],
    groupsMapping?: SAMLIDPGroupsMappingInfo[],
    acsAllowedCallbacks?: string[],
    subjectNameIdType?: string,
    subjectNameIdFormat?: string,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.ssoApplication.samlUpdate,
        {
          id,
          name,
          loginPageUrl,
          description,
          logo,
          enabled,
          useMetadataInfo,
          metadataUrl,
          entityId,
          acsUrl,
          certificate,
          attributeMapping,
          groupsMapping,
          acsAllowedCallbacks,
          subjectNameIdType,
          subjectNameIdFormat,
        },
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
