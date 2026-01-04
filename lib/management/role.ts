import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Role, RoleSearchOptions } from './types';

type MultipleRoleResponse = {
  roles: Role[];
};

const withRole = (httpClient: HttpClient) => ({
  create: (
    name: string,
    description?: string,
    permissionNames?: string[],
    tenantId?: string,
    defaultRole?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.role.create, {
        name,
        description,
        permissionNames,
        tenantId,
        default: defaultRole,
      }),
    ),
  update: (
    name: string,
    newName: string,
    description?: string,
    permissionNames?: string[],
    tenantId?: string,
    defaultRole?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.role.update, {
        name,
        newName,
        description,
        permissionNames,
        tenantId,
        default: defaultRole,
      }),
    ),
  delete: (name: string, tenantId?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.role.delete, { name, tenantId })),
  loadAll: (): Promise<SdkResponse<Role[]>> =>
    transformResponse<MultipleRoleResponse, Role[]>(
      httpClient.get(apiPaths.role.loadAll, {}),
      (data) => data.roles,
    ),
  search: (options: RoleSearchOptions): Promise<SdkResponse<Role[]>> =>
    transformResponse<MultipleRoleResponse, Role[]>(
      httpClient.post(apiPaths.role.search, options, {}),
      (data) => data.roles,
    ),
});

export default withRole;
