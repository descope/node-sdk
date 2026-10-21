import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Permission, PermissionUpdateRequest } from './types';

type MultiplePermissionResponse = {
  permissions: Permission[];
};

const withPermission = (httpClient: HttpClient) => ({
  create: (name: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.create, { name, description })),
  /**
   * Create multiple permissions in a single batch request.
   * @param permissions An array of permissions to create.
   */
  createBatch: (permissions: Permission[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.createBatch, { permissions })),
  update: (name: string, newName: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.update, { name, newName, description })),
  /**
   * Update an existing permission by its ID.
   * @param id The ID of the permission to update.
   * @param newName The updated permission name.
   * @param description Optional updated permission description.
   */
  updateWithId: (id: string, newName: string, description?: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.update, { id, newName, description })),
  /**
   * Update multiple permissions in a single batch request.
   * @param permissions An array of permission update requests.
   */
  updateBatch: (permissions: PermissionUpdateRequest[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.updateBatch, { permissions })),
  delete: (name: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.delete, { name })),
  /**
   * Delete an existing permission by its ID.
   * @param id The ID of the permission to delete.
   */
  deleteWithId: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.delete, { id })),
  /**
   * Delete multiple permissions in a single batch request, by name and/or by ID.
   * @param names Optional array of permission names to delete.
   * @param ids Optional array of permission IDs to delete.
   */
  deleteBatch: (names?: string[], ids?: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.permission.deleteBatch, { names, ids })),
  loadAll: (): Promise<SdkResponse<Permission[]>> =>
    transformResponse<MultiplePermissionResponse, Permission[]>(
      httpClient.get(apiPaths.permission.loadAll, {}),
      (data) => data.permissions,
    ),
});

export default withPermission;
