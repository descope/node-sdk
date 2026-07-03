import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Role, RoleSearchOptions, RoleUpdateRequest } from './types';

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
  /**
   * Create multiple roles in a single batch request.
   * @param roles An array of roles to create.
   * @returns The created roles.
   */
  createBatch: (roles: Role[]): Promise<SdkResponse<Role[]>> =>
    transformResponse<MultipleRoleResponse, Role[]>(
      httpClient.post(apiPaths.role.createBatch, { roles }),
      (data) => data.roles,
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
  /**
   * Update an existing role by its ID.
   * @param id The ID of the role to update.
   * @param newName The updated role name.
   * @param description Optional updated role description.
   * @param permissionNames Optional list of permission names granted by the role.
   * @param tenantId Optional tenant ID the role belongs to.
   * @param defaultRole Optional flag marking this role as a default role.
   */
  updateWithId: (
    id: string,
    newName: string,
    description?: string,
    permissionNames?: string[],
    tenantId?: string,
    defaultRole?: boolean,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.role.update, {
        id,
        newName,
        description,
        permissionNames,
        tenantId,
        default: defaultRole,
      }),
    ),
  /**
   * Update multiple roles in a single batch request.
   * @param roles An array of role update requests.
   * @returns The updated roles.
   */
  updateBatch: (roles: RoleUpdateRequest[]): Promise<SdkResponse<Role[]>> =>
    transformResponse<MultipleRoleResponse, Role[]>(
      httpClient.post(apiPaths.role.updateBatch, { roles }),
      (data) => data.roles,
    ),
  delete: (name: string, tenantId?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.role.delete, { name, tenantId })),
  /**
   * Delete an existing role by its ID.
   * @param id The ID of the role to delete.
   * @param tenantId Optional tenant ID the role belongs to.
   */
  deleteWithId: (id: string, tenantId?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.role.delete, { id, tenantId })),
  /**
   * Delete multiple roles in a single batch request, by name and/or by ID.
   * @param roleNames Optional array of role names to delete.
   * @param tenantId Optional tenant ID the roles belong to.
   * @param roleIds Optional array of role IDs to delete.
   */
  deleteBatch: (
    roleNames?: string[],
    tenantId?: string,
    roleIds?: string[],
  ): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.role.deleteBatch, { roleNames, tenantId, roleIds })),
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
