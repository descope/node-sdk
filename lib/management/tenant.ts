import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
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

const withTenant = (sdk: CoreSdk, managementKey?: string) => ({
  create: (
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
  ): Promise<SdkResponse<CreateTenantResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { name, selfProvisioningDomains, customAttributes, enforceSSO, disabled },
        { token: managementKey },
      ),
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
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { id, name, selfProvisioningDomains, customAttributes, enforceSSO, disabled },
        { token: managementKey },
      ),
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
      sdk.httpClient.post(
        apiPaths.tenant.update,
        { id, name, selfProvisioningDomains, customAttributes, enforceSSO, disabled },
        { token: managementKey },
      ),
    ),
  delete: (id: string, cascade?: boolean): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.tenant.delete, { id, cascade }, { token: managementKey }),
    ),
  load: (id: string): Promise<SdkResponse<Tenant>> =>
    transformResponse<Tenant, Tenant>(
      sdk.httpClient.get(apiPaths.tenant.load, {
        queryParams: { id },
        token: managementKey,
      }),
      (data) => data,
    ),
  loadAll: (): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      sdk.httpClient.get(apiPaths.tenant.loadAll, {
        token: managementKey,
      }),
      (data) => data.tenants,
    ),
  searchAll: (
    ids?: string[],
    names?: string[],
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
  ): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      sdk.httpClient.post(
        apiPaths.tenant.searchAll,
        {
          tenantIds: ids,
          tenantNames: names,
          tenantSelfProvisioningDomains: selfProvisioningDomains,
          customAttributes,
          enforceSSO,
          disabled,
        },
        { token: managementKey },
      ),
      (data) => data.tenants,
    ),
  getSettings: (tenantId: string): Promise<SdkResponse<TenantSettings>> =>
    transformResponse<TenantSettings, TenantSettings>(
      sdk.httpClient.get(apiPaths.tenant.settings, {
        queryParams: { id: tenantId },
        token: managementKey,
      }),
      (data) => data,
    ),
  configureSettings: (tenantId: string, settings: TenantSettings): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.settings,
        { ...settings, tenantId },
        {
          token: managementKey,
        },
      ),
    ),
  generateSSOConfigurationLink: (
    tenantId: string,
    expireDuration: number,
    ssoId?: string,
    email?: string,
    templateId?: string,
  ): Promise<SdkResponse<GenerateSSOConfigurationLinkResponse>> =>
    transformResponse<GenerateSSOConfigurationLinkResponse, GenerateSSOConfigurationLinkResponse>(
      sdk.httpClient.post(
        apiPaths.tenant.generateSSOConfigurationLink,
        { tenantId, expireTime: expireDuration, ssoId, email, templateId },
        {
          token: managementKey,
        },
      ),
      (data) => data,
    ),
});

export default withTenant;
