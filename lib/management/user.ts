import { SdkResponse, transformResponse, UserResponse, LoginOptions } from '@descope/core-js-sdk';
import { deprecate } from 'util';
import {
  ProviderTokenResponse,
  AssociatedTenant,
  GenerateEnchantedLinkForTestResponse,
  GenerateMagicLinkForTestResponse,
  GenerateOTPForTestResponse,
  GenerateEmbeddedLinkResponse,
  AttributesTypes,
  UserStatus,
  User,
  InviteBatchResponse,
} from './types';
import { CoreSdk, DeliveryMethodForTestUser } from '../types';
import apiPaths from './paths';

type SearchRequest = {
  tenantIds?: string[];
  roles?: string[];
  limit?: number;
  page?: number;
  testUsersOnly?: boolean;
  withTestUser?: boolean;
  customAttributes?: Record<string, AttributesTypes>;
  statuses?: UserStatus[];
  emails?: string[];
  phones?: string[];
};

type SingleUserResponse = {
  user: UserResponse;
};

type MultipleUsersResponse = {
  users: UserResponse[];
};

const withUser = (sdk: CoreSdk, managementKey?: string) => {
  /* Create User */
  function create(loginId: string, options?: UserOptions): Promise<SdkResponse<UserResponse>>;
  function create(
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>>;

  function create(
    loginId: string,
    emailOrOptions?: string | UserOptions,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>> {
    const body =
      typeof emailOrOptions === 'string'
        ? {
            loginId,
            email: emailOrOptions,
            phone,
            displayName,
            givenName,
            middleName,
            familyName,
            roleNames: roles,
            userTenants,
            customAttributes,
            picture,
            verifiedEmail,
            verifiedPhone,
            additionalLoginIds,
          }
        : {
            loginId,
            ...emailOrOptions,
            roleNames: emailOrOptions.roles,
            roles: undefined,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(apiPaths.user.create, body, { token: managementKey }),
      (data) => data.user,
    );
  }
  /* Create User End */

  /* Create Test User */
  function createTestUser(
    loginId: string,
    options?: UserOptions,
  ): Promise<SdkResponse<UserResponse>>;
  function createTestUser(
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>>;

  function createTestUser(
    loginId: string,
    emailOrOptions?: string | UserOptions,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>> {
    const body =
      typeof emailOrOptions === 'string'
        ? {
            loginId,
            email: emailOrOptions,
            phone,
            displayName,
            givenName,
            middleName,
            familyName,
            roleNames: roles,
            userTenants,
            customAttributes,
            picture,
            verifiedEmail,
            verifiedPhone,
            additionalLoginIds,
            test: true,
          }
        : {
            loginId,
            ...emailOrOptions,
            roleNames: emailOrOptions.roles,
            roles: undefined,
            test: true,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(apiPaths.user.create, body, { token: managementKey }),
      (data) => data.user,
    );
  }
  /* Create Test User End */

  /* Invite User */
  function invite(
    loginId: string,
    options?: UserOptions & {
      inviteUrl?: string;
      sendMail?: boolean; // send invite via mail, default is according to project settings
      sendSMS?: boolean; // send invite via text message, default is according to project settings
    },
  ): Promise<SdkResponse<UserResponse>>;
  function invite(
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    inviteUrl?: string,
    sendMail?: boolean, // send invite via mail, default is according to project settings
    sendSMS?: boolean, // send invite via text message, default is according to project settings
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>>;

  function invite(
    loginId: string,
    emailOrOptions?: string | UserOptions,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    inviteUrl?: string,
    sendMail?: boolean, // send invite via mail, default is according to project settings
    sendSMS?: boolean, // send invite via text message, default is according to project settings
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>> {
    const body =
      typeof emailOrOptions === 'string'
        ? {
            loginId,
            email: emailOrOptions,
            phone,
            displayName,
            givenName,
            middleName,
            familyName,
            roleNames: roles,
            userTenants,
            invite: true,
            customAttributes,
            picture,
            verifiedEmail,
            verifiedPhone,
            inviteUrl,
            sendMail,
            sendSMS,
            additionalLoginIds,
          }
        : {
            loginId,
            ...emailOrOptions,
            roleNames: emailOrOptions.roles,
            roles: undefined,
            invite: true,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(apiPaths.user.create, body, { token: managementKey }),
      (data) => data.user,
    );
  }
  /* Invite User End */

  /* Update User */
  function update(loginId: string, options?: UserOptions): Promise<SdkResponse<UserResponse>>;
  function update(
    loginId: string,
    email?: string,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>>;

  function update(
    loginId: string,
    emailOrOptions?: string | UserOptions,
    phone?: string,
    displayName?: string,
    roles?: string[],
    userTenants?: AssociatedTenant[],
    customAttributes?: Record<string, AttributesTypes>,
    picture?: string,
    verifiedEmail?: boolean,
    verifiedPhone?: boolean,
    givenName?: string,
    middleName?: string,
    familyName?: string,
    additionalLoginIds?: string[],
  ): Promise<SdkResponse<UserResponse>> {
    const body =
      typeof emailOrOptions === 'string'
        ? {
            loginId,
            email: emailOrOptions,
            phone,
            displayName,
            givenName,
            middleName,
            familyName,
            roleNames: roles,
            userTenants,
            customAttributes,
            picture,
            verifiedEmail,
            verifiedPhone,
            additionalLoginIds,
          }
        : {
            loginId,
            ...emailOrOptions,
            roleNames: emailOrOptions.roles,
            roles: undefined,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      sdk.httpClient.post(apiPaths.user.update, body, { token: managementKey }),
      (data) => data.user,
    );
  }
  /* Update User End */

  return {
    create,
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
    createTestUser,
    invite,
    inviteBatch: (
      users: User[],
      inviteUrl?: string,
      sendMail?: boolean, // send invite via mail, default is according to project settings
      sendSMS?: boolean, // send invite via text message, default is according to project settings
    ): Promise<SdkResponse<InviteBatchResponse>> =>
      transformResponse<InviteBatchResponse, InviteBatchResponse>(
        sdk.httpClient.post(
          apiPaths.user.createBatch,
          {
            users,
            invite: true,
            inviteUrl,
            sendMail,
            sendSMS,
          },
          { token: managementKey },
        ),
        (data) => data,
      ),
    update,
    /**
     * Delete an existing user.
     * @param loginId The login ID of the user
     */
    delete: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse(
        sdk.httpClient.post(apiPaths.user.delete, { loginId }, { token: managementKey }),
      ),
    /**
     * Delete an existing user by User ID.
     * @param userId The user ID can be found in the Subject (`sub`) claim
     * in the user's JWT.
     */
    deleteByUserId: (userId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse(
        sdk.httpClient.post(apiPaths.user.delete, { userId }, { token: managementKey }),
      ),
    /**
     * Delete all test users in the project.
     */
    deleteAllTestUsers: (): Promise<SdkResponse<never>> =>
      transformResponse(
        sdk.httpClient.delete(apiPaths.user.deleteAllTestUsers, { token: managementKey }),
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
     * Logout a user from all devices by the login ID
     * @param loginId logout user by login ID
     * @returns The UserResponse if found, throws otherwise.
     */
    logoutUser: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse(
        sdk.httpClient.post(apiPaths.user.logout, { loginId }, { token: managementKey }),
      ),
    /**
     * Logout a user from all devices by user ID. The ID can be found
     * on the user's JWT.
     * @param userId Logout a user from all devices by this user ID field
     * @returns The UserResponse if found, throws otherwise.
     */
    logoutUserByUserId: (userId: string): Promise<SdkResponse<never>> =>
      transformResponse(
        sdk.httpClient.post(apiPaths.user.logout, { userId }, { token: managementKey }),
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

    searchAll: deprecate(
      (
        tenantIds?: string[],
        roles?: string[],
        limit?: number,
        page?: number,
        testUsersOnly?: boolean,
        withTestUser?: boolean,
        customAttributes?: Record<string, AttributesTypes>,
        statuses?: UserStatus[],
        emails?: string[],
        phones?: string[],
      ): Promise<SdkResponse<UserResponse[]>> =>
        transformResponse<MultipleUsersResponse, UserResponse[]>(
          sdk.httpClient.post(
            apiPaths.user.search,
            {
              tenantIds,
              roleNames: roles,
              limit,
              page,
              testUsersOnly,
              withTestUser,
              customAttributes,
              statuses,
              emails,
              phones,
            },
            { token: managementKey },
          ),
          (data) => data.users,
        ),
      'searchAll is deprecated please use search() instead',
    ),
    /**
     * Search all users. Results can be filtered according to tenants roles and more,
     * Pagination is also available using the limit and page parameters.
     * @param searchReq an object with all the constraints for this search
     * @returns An array of UserResponse found by the query
     */
    search: (searchReq: SearchRequest): Promise<SdkResponse<UserResponse[]>> =>
      transformResponse<MultipleUsersResponse, UserResponse[]>(
        sdk.httpClient.post(
          apiPaths.user.search,
          {
            ...searchReq,
            roleNames: searchReq.roles,
            roles: undefined,
          },
          { token: managementKey },
        ),
        (data) => data.users,
      ),
    /**
     * Get the provider token for the given login ID.
     * Only users that logged-in using social providers will have token.
     * Note: The 'Manage tokens from provider' setting must be enabled.
     * @param loginId the login ID of the user
     * @param provider the provider name (google, facebook, etc.).
     * @returns The ProviderTokenResponse of the given user and provider
     */
    getProviderToken: (
      loginId: string,
      provider: string,
    ): Promise<SdkResponse<ProviderTokenResponse>> =>
      transformResponse<ProviderTokenResponse>(
        sdk.httpClient.get(apiPaths.user.getProviderToken, {
          queryParams: { loginId, provider },
          token: managementKey,
        }),
        (data) => data,
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
    updateLoginId: (loginId: string, newLoginId?: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.updateLoginId,
          { loginId, newLoginId },
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
    updateDisplayName: (
      loginId: string,
      displayName?: string,
      givenName?: string,
      middleName?: string,
      familyName?: string,
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.updateDisplayName,
          { loginId, displayName, givenName, middleName, familyName },
          { token: managementKey },
        ),
        (data) => data.user,
      ),
    updatePicture: (loginId: string, picture: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.updatePicture,
          { loginId, picture },
          { token: managementKey },
        ),
        (data) => data.user,
      ),
    updateCustomAttribute: (
      loginId: string,
      attributeKey: string,
      attributeValue: AttributesTypes,
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.updateCustomAttribute,
          { loginId, attributeKey, attributeValue },
          { token: managementKey },
        ),
        (data) => data.user,
      ),
    setRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.setRole,
          { loginId, roleNames: roles },
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
        sdk.httpClient.post(
          apiPaths.user.addTenant,
          { loginId, tenantId },
          { token: managementKey },
        ),
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
    setTenantRoles: (
      loginId: string,
      tenantId: string,
      roles: string[],
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        sdk.httpClient.post(
          apiPaths.user.setRole,
          { loginId, tenantId, roleNames: roles },
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
     * @param loginOptions optional LoginOptions - can be provided to set custom claims to the generated jwt.
     * @returns GenerateOTPForTestResponse which includes the loginId and the OTP code
     */
    generateOTPForTestUser: (
      deliveryMethod: DeliveryMethodForTestUser,
      loginId: string,
      loginOptions?: LoginOptions,
    ): Promise<SdkResponse<GenerateOTPForTestResponse>> =>
      transformResponse<GenerateOTPForTestResponse>(
        sdk.httpClient.post(
          apiPaths.user.generateOTPForTest,
          { deliveryMethod, loginId, loginOptions },
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
     * @param loginOptions optional LoginOptions - can be provided to set custom claims to the generated jwt.
     * @returns GenerateMagicLinkForTestResponse which includes the loginId and the magic link
     */
    generateMagicLinkForTestUser: (
      deliveryMethod: DeliveryMethodForTestUser,
      loginId: string,
      uri: string,
      loginOptions?: LoginOptions,
    ): Promise<SdkResponse<GenerateMagicLinkForTestResponse>> =>
      transformResponse<GenerateMagicLinkForTestResponse>(
        sdk.httpClient.post(
          apiPaths.user.generateMagicLinkForTest,
          { deliveryMethod, loginId, URI: uri, loginOptions },
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
     * @param loginOptions optional LoginOptions - can be provided to set custom claims to the generated jwt.
     * @returns GenerateEnchantedLinkForTestResponse which includes the loginId, the enchanted link and the pendingRef
     */
    generateEnchantedLinkForTestUser: (
      loginId: string,
      uri: string,
      loginOptions?: LoginOptions,
    ): Promise<SdkResponse<GenerateEnchantedLinkForTestResponse>> =>
      transformResponse<GenerateEnchantedLinkForTestResponse>(
        sdk.httpClient.post(
          apiPaths.user.generateEnchantedLinkForTest,
          { loginId, URI: uri, loginOptions },
          { token: managementKey },
        ),
        (data) => data,
      ),

    generateEmbeddedLink: (
      loginId: string,
      customClaims?: Record<string, any>,
    ): Promise<SdkResponse<GenerateEmbeddedLinkResponse>> =>
      transformResponse<GenerateEmbeddedLinkResponse>(
        sdk.httpClient.post(
          apiPaths.user.generateEmbeddedLink,
          { loginId, customClaims },
          { token: managementKey },
        ),
        (data) => data,
      ),

    /**
     * Set password for the given login ID of user.
     * Note: The password will automatically be set as expired.
     * The user will not be able to log-in with this password, and will be required to replace it on next login.
     * See also: expirePassword
     * @param loginId The login ID of the user
     * @param password The password to set for the user
     */
    setPassword: (loginId: string, password: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        sdk.httpClient.post(
          apiPaths.user.setPassword,
          { loginId, password },
          { token: managementKey },
        ),
        (data) => data,
      ),

    /**
     * Expire password for the given login ID.
     * Note: user sign-in with an expired password, the user will get an error with code.
     * Use the `ResetPassword` or `ReplacePassword` methods to reset/replace the password.
     * @param loginId The login ID of the user
     */
    expirePassword: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        sdk.httpClient.post(apiPaths.user.expirePassword, { loginId }, { token: managementKey }),
        (data) => data,
      ),

    /**
     * Removes all registered passkeys (WebAuthn devices) for the user with the given login ID.
     * Note: The user might not be able to login anymore if they have no other authentication
     * methods or a verified email/phone.
     * @param loginId The login ID of the user
     */
    removeAllPasskeys: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        sdk.httpClient.post(apiPaths.user.removeAllPasskeys, { loginId }, { token: managementKey }),
        (data) => data,
      ),
  };
};

export interface UserOptions {
  email?: string;
  phone?: string;
  displayName?: string;
  roles?: string[];
  userTenants?: AssociatedTenant[];
  customAttributes?: Record<string, AttributesTypes>;
  picture?: string;
  verifiedEmail?: boolean;
  verifiedPhone?: boolean;
  givenName?: string;
  middleName?: string;
  familyName?: string;
  additionalLoginIds?: string[];
}

export default withUser;
