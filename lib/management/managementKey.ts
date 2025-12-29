import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import {
  MgmtKeyCreateResponse,
  MgmtKeyGetResponse,
  MgmtKeyReBac,
  MgmtKeySearchResponse,
  MgmtKeyStatus,
  MgmtKeyUpdateResponse,
} from './types';
import apiPaths from './paths';

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
  ): Promise<SdkResponse<MgmtKeyUpdateResponse>> =>
    transformResponse(
      httpClient.patch(apiPaths.managementKey.update, {
        id,
        name,
        description,
        permittedIps,
        status,
      }),
    ),

  delete: (ids: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.managementKey.delete, { ids })),

  load: (id: string): Promise<SdkResponse<MgmtKeyGetResponse>> =>
    transformResponse(httpClient.get(apiPaths.managementKey.load, { queryParams: { id } })),

  search: (): Promise<SdkResponse<MgmtKeySearchResponse>> =>
    transformResponse(httpClient.get(apiPaths.managementKey.search)),
});

export default withManagementKey;
