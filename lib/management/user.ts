import { SdkResponse, transformResponse, UserResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { UserTenant } from './types';

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
    roleNames?: string[],
    userTenants?: UserTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        { identifier, email, phone, displayName, roleNames, userTenants },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  update: (
    identifier: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roleNames?: string[],
    userTenants?: UserTenant[],
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.update,
        { identifier, email, phone, displayName, roleNames, userTenants },
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
   * Load an existing user by JWT subject. The JWT subject can be found
   * on the user's JWT.
   * @param jwtSubject load a user by this JWT subject field
   * @returns The UserResponse if found, throws otherwise.
   */
  loadByJwtSubject: (jwtSubject: string): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.get(apiPaths.user.load, {
        queryParams: { jwtSubject },
        token: managementKey,
      }),
      (data) => data.user,
    ),
  searchAll: (
    tenantIds?: string[],
    roleNames?: string[],
    limit?: number,
  ): Promise<SdkResponse<UserResponse[]>> =>
    transformResponse<MultipleUsersResponse, UserResponse[]>(
      sdk.httpClient.post(
        apiPaths.user.search,
        { tenantIds, roleNames, limit },
        { token: managementKey },
      ),
      (data) => data.users,
    ),
});

export default withUser;
