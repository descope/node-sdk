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
