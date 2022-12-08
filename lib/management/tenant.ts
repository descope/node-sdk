import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CreateTenantResponse } from './types';

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
});

export default withTenant;
