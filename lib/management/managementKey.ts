import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { MgmtKey, MgmtKeyCreateResponse, MgmtKeyReBac, MgmtKeyStatus } from './types';

const withManagementKey = (httpClient: HttpClient) => ({
  create: (
    name: string,
    reBac: MgmtKeyReBac,
    description?: string,
    expiresIn?: number,
    permittedIps?: string[],
  ): Promise<SdkResponse<MgmtKeyCreateResponse>> =>
    transformResponse(
      httpClient.put(apiPaths.managementKey.create, {
        name,
        description,
        expiresIn,
        permittedIps,
        reBac,
      }),
    ),

  update: (
    id: string,
    name: string,
    description: string,
    status: MgmtKeyStatus,
    permittedIps?: string[],
  ): Promise<SdkResponse<MgmtKey>> =>
    transformResponse(
      httpClient.patch(apiPaths.managementKey.update, {
        id,
        name,
        description,
        permittedIps,
        status,
      }),
      (data) => data.key,
    ),

  delete: (ids: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.managementKey.delete, { ids })),

  load: (id: string): Promise<SdkResponse<MgmtKey>> =>
    transformResponse(
      httpClient.get(apiPaths.managementKey.load, { queryParams: { id } }),
      (data) => data.key,
    ),

  search: (): Promise<SdkResponse<MgmtKey[]>> =>
    transformResponse(httpClient.get(apiPaths.managementKey.search), (data) => data.keys),
});

export default withManagementKey;
