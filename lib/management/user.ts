import { DeliveryMethod, SdkResponse, transformResponse, UserResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  AssociatedTenant,
  GenerateEnchantedLinkForTestResponse,
  GenerateMagicLinkForTestResponse,
  GenerateOTPForTestResponse,
  AttributesTypes,
} from './types';

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
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        {
          loginId,
          email,
          phone,
          displayName,
          roleNames: roles,
          userTenants,
          customAttributes,
          picture,
        },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  /**
   * Create a new test user.
   * The loginID is required and will determine what the user will use to sign in.
   * Make sure the login id is unique for test. All other fields are optional.
   *
   * You can later generate OTP, Magic link and enchanted link to use in the test without the need
   * of 3rd party messaging services.
   * Those users are not counted as part of the monthly active users
   * @returns The UserResponse if found, throws otherwise.
   */
  createTestUser: (
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        {
          loginId,
          email,
          phone,
          displayName,
          roleNames: roles,
          userTenants,
          test: true,
          customAttributes,
          picture,
        },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  invite: (
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.create,
        {
          loginId,
          email,
          phone,
          displayName,
          roleNames: roles,
          userTenants,
          invite: true,
          customAttributes,
          picture,
        },
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
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(
        apiPaths.user.update,
        {
          loginId,
          email,
          phone,
          displayName,
          roleNames: roles,
          userTenants,
          customAttributes,
          picture,
        },
        { token: managementKey },
      ),
      (data) => data.user,
    ),
  delete: (loginId: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.user.delete, { loginId }, { token: managementKey }),
    ),
  /**
   * Delete all test users in the project.
   */
  deleteAllTestUsers: (): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.delete(apiPaths.user.deleteAllTestUsers, {}, { token: managementKey }),
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
   * @param testUsersOnly optionally filter only test users
   * @param withTestUser optionally include test users in search
   * @returns An array of UserResponse found by the query
   */
  searchAll: (
    tenantIds?: string[],
    roles?: string[],
    limit?: number,
    page?: number,
    testUsersOnly?: boolean,
    withTestUser?: boolean,
    customAttributes?: Record<string, AttributesTypes>,
  ): Promise<SdkResponse<UserResponse[]>> =>
    transformResponse<MultipleUsersResponse, UserResponse[]>(
      sdk.httpClient.post(
        apiPaths.user.search,
        { tenantIds, roleNames: roles, limit, page, testUsersOnly, withTestUser, customAttributes },
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

  /**
   * Generate OTP for the given login ID of a test user.
   * Choose the selected delivery method for verification.
   * Returns the code for the login (exactly as it sent via Email or SMS)
   * This is useful when running tests and don't want to use 3rd party messaging services
   *
   * @param deliveryMethod optional DeliveryMethod
   * @param loginId login ID of a test user
   * @returns GenerateOTPForTestResponse which includes the loginId and the OTP code
   */
  generateOTPForTestUser: (
    deliveryMethod: DeliveryMethod,
    loginId: string,
  ): Promise<SdkResponse<GenerateOTPForTestResponse>> =>
    transformResponse<GenerateOTPForTestResponse>(
      sdk.httpClient.post(
        apiPaths.user.generateOTPForTest,
        { deliveryMethod, loginId },
        { token: managementKey },
      ),
      (data) => data,
    ),

  /**
   * Generate Magic Link for the given login ID of a test user.
   * Choose the selected delivery method for verification.
   * It returns the link for the login (exactly as it sent via Email)
   * This is useful when running tests and don't want to use 3rd party messaging services
   *
   * @param deliveryMethod optional DeliveryMethod
   * @param loginId login ID of a test user
   * @param uri optional redirect uri which will be used instead of any global configuration.
   * @returns GenerateMagicLinkForTestResponse which includes the loginId and the magic link
   */
  generateMagicLinkForTestUser: (
    deliveryMethod: DeliveryMethod,
    loginId: string,
    uri: string,
  ): Promise<SdkResponse<GenerateMagicLinkForTestResponse>> =>
    transformResponse<GenerateMagicLinkForTestResponse>(
      sdk.httpClient.post(
        apiPaths.user.generateMagicLinkForTest,
        { deliveryMethod, loginId, URI: uri },
        { token: managementKey },
      ),
      (data) => data,
    ),

  /**
   * Generate Enchanted Link for the given login ID of a test user.
   * It returns the link for the login (exactly as it sent via Email)
   * and pendingRef which is used to poll for a valid session
   * This is useful when running tests and don't want to use 3rd party messaging services
   *
   * @param loginId login ID of a test user
   * @param uri optional redirect uri which will be used instead of any global configuration.
   * @returns GenerateEnchantedLinkForTestResponse which includes the loginId, the enchanted link and the pendingRef
   */
  generateEnchantedLinkForTestUser: (
    loginId: string,
    uri: string,
  ): Promise<SdkResponse<GenerateEnchantedLinkForTestResponse>> =>
    transformResponse<GenerateEnchantedLinkForTestResponse>(
      sdk.httpClient.post(
        apiPaths.user.generateEnchantedLinkForTest,
        { loginId, URI: uri },
        { token: managementKey },
      ),
      (data) => data,
    ),
});

export default withUser;
