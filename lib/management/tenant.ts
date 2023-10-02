import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CreateTenantResponse, Tenant, AttributesTypes } from './types';

type MultipleTenantResponse = {
  tenants: Tenant[];
};

const withTenant = (sdk: CoreSdk, managementKey?: string) => ({
  create: (
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
  ): Promise<SdkResponse<CreateTenantResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { name, selfProvisioningDomains, customAttributes },
        { token: managementKey },
      ),
    ),
  createWithId: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { id, name, selfProvisioningDomains, customAttributes },
        { token: managementKey },
      ),
    ),
  update: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.update,
        { id, name, selfProvisioningDomains, customAttributes },
        { token: managementKey },
      ),
    ),
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.tenant.delete, { id }, { token: managementKey }),
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
  ): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      sdk.httpClient.post(
        apiPaths.tenant.searchAll,
        {
          tenantIds: ids,
          tenantNames: names,
          tenantSelfProvisioningDomains: selfProvisioningDomains,
          customAttributes,
        },
        { token: managementKey },
      ),
      (data) => data.tenants,
    ),
});

export default withTenant;
