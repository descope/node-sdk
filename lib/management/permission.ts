import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { Permission } from './types';

type MultiplePermissionResponse = {
  permissions: Permission[];
};

const withPermission = (sdk: CoreSdk, managementKey?: string) => ({
  create: (name: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.permission.create,
        { name, description },
        { token: managementKey },
      ),
    ),
  update: (name: string, newName: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.permission.update,
        { name, newName, description },
        { token: managementKey },
      ),
    ),
  delete: (name: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.permission.delete, { name }, { token: managementKey }),
    ),
  loadAll: (): Promise<SdkResponse<Permission[]>> =>
    transformResponse<MultiplePermissionResponse, Permission[]>(
      sdk.httpClient.get(apiPaths.permission.loadAll, {
        token: managementKey,
      }),
      (data) => data.permissions,
    ),
});

export default withPermission;
