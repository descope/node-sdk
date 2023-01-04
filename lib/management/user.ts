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
    identifier: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        { identifier, email, phone, displayName, roleNames: roles, userTenants },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  update: (
    identifier: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.update,
        { identifier, email, phone, displayName, roleNames: roles, userTenants },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  delete: (identifier: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.user.delete, { identifier }, { token: managementKey }),
    ),
  load: (identifier: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.get(apiPaths.user.load, {
        queryParams: { identifier },
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
  searchAll: (
    tenantIds?: string[],
    roles?: string[],
    limit?: number,
  ): Promise<SdkResponse<UserResponse[]>> =>
    transformResponse<MultipleUsersResponse, UserResponse[]>(
      sdk.httpClient.post(
        apiPaths.user.search,
        { tenantIds, roleNames: roles, limit },
        { token: managementKey },
      ),
      (data) => data.users,
    ),
});

export default withUser;
