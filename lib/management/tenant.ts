import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CreateTenantResponse, Tenant } from './types';

type MultipleTenantResponse = {
  tenants: Tenant[];
};

const withTenant = (sdk: CoreSdk, managementKey?: string) => ({
  create: (
    name: string,
    selfProvisioningDomains?: string[],
  ): Promise<SdkResponse<CreateTenantResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { name, selfProvisioningDomains },
        { token: managementKey },
      ),
    ),
  createWithId: (
    tenantId: string,
    name: string,
    selfProvisioningDomains?: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.create,
        { tenantId, name, selfProvisioningDomains },
        { token: managementKey },
      ),
    ),
  update: (
    tenantId: string,
    name: string,
    selfProvisioningDomains?: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.tenant.update,
        { tenantId, name, selfProvisioningDomains },
        { token: managementKey },
      ),
    ),
  delete: (tenantId: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.tenant.delete, { tenantId }, { token: managementKey }),
    ),
  loadAll: (): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      sdk.httpClient.get(apiPaths.tenant.loadAll, {
        token: managementKey,
      }),
      (data) => data.tenants,
    ),
});

export default withTenant;
