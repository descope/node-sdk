import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  CreateTenantResponse,
  Tenant,
  AttributesTypes,
  TenantSettings,
  GenerateSSOConfigurationLinkResponse,
} from './types';

type MultipleTenantResponse = {
  tenants: Tenant[];
};

const withTenant = (httpClient: HttpClient) => ({
  create: (
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
  ): Promise<SdkResponse<CreateTenantResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.create, {
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
      }),
    ),
  createWithId: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.create, {
        id,
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
      }),
    ),
  update: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.update, {
        id,
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
      }),
    ),
  delete: (id: string, cascade?: boolean): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.tenant.delete, { id, cascade })),
  load: (id: string): Promise<SdkResponse<Tenant>> =>
    transformResponse<Tenant, Tenant>(
      httpClient.get(apiPaths.tenant.load, {
        queryParams: { id },
      }),
      (data) => data,
    ),
  loadAll: (): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      httpClient.get(apiPaths.tenant.loadAll, {}),
      (data) => data.tenants,
    ),
  searchAll: (
    ids?: string[],
    names?: string[],
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
  ): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      httpClient.post(apiPaths.tenant.searchAll, {
        tenantIds: ids,
        tenantNames: names,
        tenantSelfProvisioningDomains: selfProvisioningDomains,
        customAttributes,
      }),
      (data) => data.tenants,
    ),
  getSettings: (tenantId: string): Promise<SdkResponse<TenantSettings>> =>
    transformResponse<TenantSettings, TenantSettings>(
      httpClient.get(apiPaths.tenant.settings, {
        queryParams: { id: tenantId },
      }),
      (data) => data,
    ),
  configureSettings: (tenantId: string, settings: TenantSettings): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.tenant.settings, { ...settings, tenantId }, {})),
  generateSSOConfigurationLink: (
    tenantId: string,
    expireDuration: number,
    ssoId?: string,
    email?: string,
    templateId?: string,
  ): Promise<SdkResponse<GenerateSSOConfigurationLinkResponse>> =>
    transformResponse<GenerateSSOConfigurationLinkResponse, GenerateSSOConfigurationLinkResponse>(
      httpClient.post(
        apiPaths.tenant.generateSSOConfigurationLink,
        { tenantId, expireTime: expireDuration, ssoId, email, templateId },
        {},
      ),
      (data) => data,
    ),
});

export default withTenant;
