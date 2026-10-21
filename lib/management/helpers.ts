import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CustomAttribute, User } from './types';

/**
 * Transforms user objects by converting roles to roleNames
 */
function transformUsersForBatch(users: User[]): any[] {
  return users.map(({ loginIdOrUserId, loginId, roles, ...user }) => ({
    ...user,
    loginId: loginIdOrUserId ?? loginId,
    roleNames: roles,
  }));
}

type CustomAttributesResponse = { data: CustomAttribute[] };

/**
 * Builds the get/create/delete calls for a custom attributes schema. The user, family-scoped user
 * and family schemas share the same request and response shapes and differ only in their paths.
 */
const withCustomAttributes = (
  httpClient: HttpClient,
  paths: { get: string; create: string; delete: string },
) => ({
  get: (): Promise<SdkResponse<CustomAttribute[]>> =>
    transformResponse<CustomAttributesResponse, CustomAttribute[]>(
      httpClient.get(paths.get),
      (data) => data.data,
    ),
  create: (attributes: CustomAttribute[]): Promise<SdkResponse<CustomAttribute[]>> =>
    transformResponse<CustomAttributesResponse, CustomAttribute[]>(
      httpClient.post(paths.create, { attributes }),
      (data) => data.data,
    ),
  delete: (names: string[]): Promise<SdkResponse<CustomAttribute[]>> =>
    transformResponse<CustomAttributesResponse, CustomAttribute[]>(
      httpClient.post(paths.delete, { names }),
      (data) => data.data,
    ),
});

export { transformUsersForBatch, withCustomAttributes };
