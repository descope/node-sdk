import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Permission } from './types';

type MultiplePermissionResponse = {
  permissions: Permission[];
};

const withPermission = (httpClient: HttpClient) => ({
  create: (name: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.create, { name, description })),
  update: (name: string, newName: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.update, { name, newName, description })),
  delete: (name: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.delete, { name })),
  loadAll: (): Promise<SdkResponse<Permission[]>> =>
    transformResponse<MultiplePermissionResponse, Permission[]>(
      httpClient.get(apiPaths.permission.loadAll, {}),
      (data) => data.permissions,
    ),
});

export default withPermission;
