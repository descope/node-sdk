import { SdkResponse, transformResponse, UserResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { AssociatedTenant } from './types';

type SingleUserResponse = {
  user: UserResponse;
};

type MultipleUsersResponse = {
  users: UserResponse[];
};

const withUser = (sdk: CoreSdk, managementKey?: string) => ({
  create: (
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        { loginId, email, phone, displayName, roleNames: roles, userTenants },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  update: (
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.update,
        { loginId, email, phone, displayName, roleNames: roles, userTenants },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  delete: (loginId: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.user.delete, { loginId }, { token: managementKey }),
    ),
  load: (loginId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.get(apiPaths.user.load, {
        queryParams: { loginId },
        token: managementKey,
      }),
      (data) => data.user,
    ),
  /**
   * Load an existing user by user ID. The ID can be found
   * on the user's JWT.
   * @param userId load a user by this user ID field
   * @returns The UserResponse if found, throws otherwise.
   */
  loadByUserId: (userId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.get(apiPaths.user.load, {
        queryParams: { userId },
        token: managementKey,
      }),
      (data) => data.user,
    ),
  /**
   * Search all users. Results can be filtered according to tenants and/or
   * roles, and also paginated used the limit and page parameters.
   * @param tenantIds optional list of tenant IDs to filter by
   * @param roles optional list of roles to filter by
   * @param limit optionally limit the response, leave out for default limit
   * @param page optionally paginate over the response
   * @returns An array of UserResponse found by the query
   */
  searchAll: (
    tenantIds?: string[],
    roles?: string[],
    limit?: number,
    page?: number,
  ): Promise<SdkResponse<UserResponse[]>> =>
    transformResponse<MultipleUsersResponse, UserResponse[]>(
      sdk.httpClient.post(
        apiPaths.user.search,
        { tenantIds, roleNames: roles, limit, page },
        { token: managementKey },
      ),
      (data) => data.users,
    ),
  activate: (loginId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.updateStatus,
        { loginId, status: 'enabled' },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  deactivate: (loginId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.updateStatus,
        { loginId, status: 'disabled' },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  updateEmail: (
    loginId: string,
    email: string,
    isVerified: boolean,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.updateEmail,
        { loginId, email, verified: isVerified },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  updatePhone: (
    loginId: string,
    phone: string,
    isVerified: boolean,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.updatePhone,
        { loginId, phone, verified: isVerified },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  updateDisplayName: (loginId: string, displayName: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.updateDisplayName,
        { loginId, displayName },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  addRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.addRole,
        { loginId, roleNames: roles },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  removeRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.removeRole,
        { loginId, roleNames: roles },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  addTenant: (loginId: string, tenantId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(apiPaths.user.addTenant, { loginId, tenantId }, { token: managementKey }),
      (data) => data.user,
    ),
  removeTenant: (loginId: string, tenantId: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.removeTenant,
        { loginId, tenantId },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  addTenantRoles: (
    loginId: string,
    tenantId: string,
    roles: string[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.addRole,
        { loginId, tenantId, roleNames: roles },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  removeTenantRoles: (
    loginId: string,
    tenantId: string,
    roles: string[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.removeRole,
        { loginId, tenantId, roleNames: roles },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
});

export default withUser;
