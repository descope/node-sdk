import {
  HttpClient,
  SdkResponse,
  transformResponse,
  UserHistoryResponse,
  UserResponse,
  LoginOptions,
} from '@descope/core-js-sdk';
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
  CreateOrInviteBatchResponse,
  TemplateOptions,
  ProviderTokenOptions,
  UserOptions,
} from './types';
import { DeliveryMethodForTestUser } from '../types';
import apiPaths from './paths';
import { transformUsersForBatch } from './helpers';

type SearchSort = {
  field: string;
  desc?: boolean;
};

type RolesList = {
  values: string[];
  and?: boolean;
};

type SearchRequest = {
  page?: number;
  limit?: number;
  sort?: SearchSort[];
  text?: string;
  emails?: string[];
  phones?: string[];
  statuses?: UserStatus[];
  roles?: string[];
  tenantIds?: string[];
  customAttributes?: Record<string, AttributesTypes>;
  withTestUser?: boolean;
  testUsersOnly?: boolean;
  ssoAppIds?: string[];
  loginIds?: string[];
  userIds?: string[];
  fromCreatedTime?: number; // Search users created after this time (epoch in milliseconds)
  toCreatedTime?: number; // Search users created before this time (epoch in milliseconds)
  fromModifiedTime?: number; // Search users modified after this time (epoch in milliseconds)
  toModifiedTime?: number; // Search users modified before this time (epoch in milliseconds)
  tenantRoleIds?: Record<string, RolesList>; // Search users based on tenants and role IDs
  tenantRoleNames?: Record<string, RolesList>; // Search users based on tenants and role names
};

type SingleUserResponse = {
  user: UserResponse;
};

type MultipleUsersResponse = {
  users: UserResponse[];
};

const withUser = (httpClient: HttpClient) => {
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
    // We support both the old and new parameters forms of create user
    // 1. The new form - create(loginId, { email, phone, ... }})
    // 2. The old form - create(loginId, email, phone, ...)
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
            roleNames: emailOrOptions?.roles,
            roles: undefined,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      httpClient.post(apiPaths.user.create, body),
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
    // We support both the old and new parameters forms of create test user
    // 1. The new form - createTestUser(loginId, { email, phone, ... }})
    // 2. The old form - createTestUser(loginId, email, phone, ...)
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
            roleNames: emailOrOptions?.roles,
            roles: undefined,
            test: true,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      httpClient.post(apiPaths.user.createTestUser, body),
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
      templateOptions?: TemplateOptions;
      templateId?: string;
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
    templateId?: string,
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
    templateId?: string,
  ): Promise<SdkResponse<UserResponse>> {
    // We support both the old and new parameters forms of invite user
    // 1. The new form - invite(loginId, { email, phone, ... }})
    // 2. The old form - invite(loginId, email, phone, ...)
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
            templateId,
          }
        : {
            loginId,
            ...emailOrOptions,
            roleNames: emailOrOptions?.roles,
            roles: undefined,
            invite: true,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      httpClient.post(apiPaths.user.create, body),
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
    // We support both the old and new parameters forms of update user
    // 1. The new form - update(loginId, { email, phone, ... }})
    // 2. The old form - update(loginId, email, phone, ...)
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
            roleNames: emailOrOptions?.roles,
            roles: undefined,
          };
    return transformResponse<SingleUserResponse, UserResponse>(
      httpClient.post(apiPaths.user.update, body),
      (data) => data.user,
    );
  }
  /* Update User End */

  /**
   * Patches an existing user.
   * @param loginId The login ID of the user
   * @param options The fields to update. Only the provided ones will be updated.
   */
  function patch(loginId: string, options: PatchUserOptions): Promise<SdkResponse<UserResponse>> {
    const body = {
      loginId,
    } as any;

    if (options.email !== undefined) {
      body.email = options.email;
    }
    if (options.phone !== undefined) {
      body.phone = options.phone;
    }
    if (options.displayName !== undefined) {
      body.displayName = options.displayName;
    }
    if (options.givenName !== undefined) {
      body.givenName = options.givenName;
    }
    if (options.middleName !== undefined) {
      body.middleName = options.middleName;
    }
    if (options.familyName !== undefined) {
      body.familyName = options.familyName;
    }
    if (options.roles !== undefined) {
      body.roleNames = options.roles;
    }
    if (options.userTenants !== undefined) {
      body.userTenants = options.userTenants;
    }
    if (options.customAttributes !== undefined) {
      body.customAttributes = options.customAttributes;
    }
    if (options.picture !== undefined) {
      body.picture = options.picture;
    }
    if (options.verifiedEmail !== undefined) {
      body.verifiedEmail = options.verifiedEmail;
    }
    if (options.verifiedPhone !== undefined) {
      body.verifiedPhone = options.verifiedPhone;
    }
    if (options.ssoAppIds !== undefined) {
      body.ssoAppIds = options.ssoAppIds;
    }
    if (options.scim !== undefined) {
      body.scim = options.scim;
    }
    if (options.status !== undefined) {
      body.status = options.status;
    }

    return transformResponse<SingleUserResponse, UserResponse>(
      httpClient.patch(apiPaths.user.patch, body),
      (data) => data.user,
    );
  }

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
      templateOptions?: TemplateOptions,
      templateId?: string,
    ): Promise<SdkResponse<CreateOrInviteBatchResponse>> =>
      transformResponse<CreateOrInviteBatchResponse, CreateOrInviteBatchResponse>(
        httpClient.post(apiPaths.user.createBatch, {
          users: transformUsersForBatch(users),
          invite: true,
          inviteUrl,
          sendMail,
          sendSMS,
          templateOptions,
          templateId,
        }),
        (data) => data,
      ),
    createBatch: (users: User[]): Promise<SdkResponse<CreateOrInviteBatchResponse>> =>
      transformResponse<CreateOrInviteBatchResponse, CreateOrInviteBatchResponse>(
        httpClient.post(apiPaths.user.createBatch, {
          users: transformUsersForBatch(users),
        }),
        (data) => data,
      ),
    deleteBatch: (userIds: string[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.user.deleteBatch, { userIds })),
    update,
    patch,
    /**
     * Delete an existing user.
     * @param loginId The login ID of the user
     */
    delete: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.user.delete, { loginId })),
    /**
     * Delete an existing user by User ID.
     * @param userId The user ID can be found in the Subject (`sub`) claim
     * in the user's JWT.
     */
    deleteByUserId: (userId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse(httpClient.post(apiPaths.user.delete, { userId })),
    /**
     * Delete all test users in the project.
     */
    deleteAllTestUsers: (): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.delete(apiPaths.user.deleteAllTestUsers)),
    load: (loginId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.get(apiPaths.user.load, {
          queryParams: { loginId },
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
        httpClient.get(apiPaths.user.load, {
          queryParams: { userId },
        }),
        (data) => data.user,
      ),
    /**
     * Logout a user from all devices by the login ID
     * @param loginId logout user by login ID
     * @returns The UserResponse if found, throws otherwise.
     */
    logoutUser: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.user.logout, { loginId })),
    /**
     * Logout a user from all devices by user ID. The ID can be found
     * on the user's JWT.
     * @param userId Logout a user from all devices by this user ID field
     * @returns The UserResponse if found, throws otherwise.
     */
    logoutUserByUserId: (userId: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.user.logout, { userId })),
    /**
     * Search all users. Results can be filtered according to tenants and/or
     * roles, and also paginated used the limit and page parameters.
     * @deprecated Use search instead
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
      statuses?: UserStatus[],
      emails?: string[],
      phones?: string[],
    ): Promise<SdkResponse<UserResponse[]>> =>
      transformResponse<MultipleUsersResponse, UserResponse[]>(
        httpClient.post(apiPaths.user.search, {
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
        }),
        (data) => data.users,
      ),
    searchTestUsers: (searchReq: SearchRequest): Promise<SdkResponse<UserResponse[]>> =>
      transformResponse<MultipleUsersResponse, UserResponse[]>(
        httpClient.post(apiPaths.user.searchTestUsers, {
          ...searchReq,
          withTestUser: true,
          testUsersOnly: true,
          roleNames: searchReq.roles,
          roles: undefined,
        }),
        (data) => data.users,
      ),
    search: (searchReq: SearchRequest): Promise<SdkResponse<UserResponse[]>> =>
      transformResponse<MultipleUsersResponse, UserResponse[]>(
        httpClient.post(apiPaths.user.search, {
          ...searchReq,
          roleNames: searchReq.roles,
          roles: undefined,
        }),
        (data) => data.users,
      ),
    /**
     * Get the provider token for the given login ID.
     * Only users that logged-in using social providers will have token.
     * Note: The 'Manage tokens from provider' setting must be enabled.
     * @param loginId the login ID of the user
     * @param provider the provider name (google, facebook, etc.).
     * @param providerTokenOptions optional, includes options for getting the provider token:
     *    withRefreshToken - include the refresh token in the response
     *    forceRefresh - force to refresh the token
     * @returns The ProviderTokenResponse of the given user and provider
     */
    getProviderToken: (
      loginId: string,
      provider: string,
      providerTokenOptions?: ProviderTokenOptions,
    ): Promise<SdkResponse<ProviderTokenResponse>> =>
      transformResponse<ProviderTokenResponse>(
        httpClient.get(apiPaths.user.getProviderToken, {
          queryParams: {
            loginId,
            provider,
            withRefreshToken: providerTokenOptions?.withRefreshToken ? 'true' : 'false',
            forceRefresh: providerTokenOptions?.forceRefresh ? 'true' : 'false',
          },
        }),
        (data) => data,
      ),
    activate: (loginId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updateStatus, { loginId, status: 'enabled' }),
        (data) => data.user,
      ),
    deactivate: (loginId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updateStatus, { loginId, status: 'disabled' }),
        (data) => data.user,
      ),
    updateLoginId: (loginId: string, newLoginId?: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updateLoginId, { loginId, newLoginId }),
        (data) => data.user,
      ),
    updateEmail: (
      loginId: string,
      email: string,
      isVerified: boolean,
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updateEmail, { loginId, email, verified: isVerified }),
        (data) => data.user,
      ),
    updatePhone: (
      loginId: string,
      phone: string,
      isVerified: boolean,
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updatePhone, { loginId, phone, verified: isVerified }),
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
        httpClient.post(apiPaths.user.updateDisplayName, {
          loginId,
          displayName,
          givenName,
          middleName,
          familyName,
        }),
        (data) => data.user,
      ),
    updatePicture: (loginId: string, picture: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updatePicture, { loginId, picture }),
        (data) => data.user,
      ),
    updateCustomAttribute: (
      loginId: string,
      attributeKey: string,
      attributeValue: AttributesTypes,
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.updateCustomAttribute, {
          loginId,
          attributeKey,
          attributeValue,
        }),
        (data) => data.user,
      ),
    setRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.setRole, { loginId, roleNames: roles }),
        (data) => data.user,
      ),
    addRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.addRole, { loginId, roleNames: roles }),
        (data) => data.user,
      ),
    removeRoles: (loginId: string, roles: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.removeRole, { loginId, roleNames: roles }),
        (data) => data.user,
      ),
    addTenant: (loginId: string, tenantId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.addTenant, { loginId, tenantId }),
        (data) => data.user,
      ),
    removeTenant: (loginId: string, tenantId: string): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.removeTenant, { loginId, tenantId }),
        (data) => data.user,
      ),
    setTenantRoles: (
      loginId: string,
      tenantId: string,
      roles: string[],
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.setRole, { loginId, tenantId, roleNames: roles }),
        (data) => data.user,
      ),
    addTenantRoles: (
      loginId: string,
      tenantId: string,
      roles: string[],
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.addRole, { loginId, tenantId, roleNames: roles }),
        (data) => data.user,
      ),
    removeTenantRoles: (
      loginId: string,
      tenantId: string,
      roles: string[],
    ): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.removeRole, { loginId, tenantId, roleNames: roles }),
        (data) => data.user,
      ),
    addSSOapps: (loginId: string, ssoAppIds: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.addSSOApps, { loginId, ssoAppIds }),
        (data) => data.user,
      ),
    setSSOapps: (loginId: string, ssoAppIds: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.setSSOApps, { loginId, ssoAppIds }),
        (data) => data.user,
      ),
    removeSSOapps: (loginId: string, ssoAppIds: string[]): Promise<SdkResponse<UserResponse>> =>
      transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.user.removeSSOApps, { loginId, ssoAppIds }),
        (data) => data.user,
      ),

    /**
     * Generate OTP for the given login ID of a test user.
     * Choose the selected delivery method for verification.
     * Returns the code for the login (exactly as it sent via Email, SMS, Voice call or WhatsApp)
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
        httpClient.post(apiPaths.user.generateOTPForTest, {
          deliveryMethod,
          loginId,
          loginOptions,
        }),
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
        httpClient.post(apiPaths.user.generateMagicLinkForTest, {
          deliveryMethod,
          loginId,
          URI: uri,
          loginOptions,
        }),
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
        httpClient.post(apiPaths.user.generateEnchantedLinkForTest, {
          loginId,
          URI: uri,
          loginOptions,
        }),
        (data) => data,
      ),

    generateEmbeddedLink: (
      loginId: string,
      customClaims?: Record<string, any>,
      timeout?: number,
    ): Promise<SdkResponse<GenerateEmbeddedLinkResponse>> =>
      transformResponse<GenerateEmbeddedLinkResponse>(
        httpClient.post(apiPaths.user.generateEmbeddedLink, { loginId, customClaims, timeout }),
        (data) => data,
      ),

    generateSignUpEmbeddedLink: (
      loginId: string,
      user?: {
        name?: string;
        givenName?: string;
        middleName?: string;
        familyName?: string;
        phone?: string;
        email?: string;
      },
      emailVerified?: boolean,
      phoneVerified?: boolean,
      loginOptions?: LoginOptions,
      timeout?: number,
    ): Promise<SdkResponse<GenerateEmbeddedLinkResponse>> =>
      transformResponse<GenerateEmbeddedLinkResponse>(
        httpClient.post(apiPaths.user.generateSignUpEmbeddedLink, {
          loginId,
          user,
          emailVerified,
          phoneVerified,
          loginOptions,
          timeout,
        }),
        (data) => data,
      ),

    /**
     * Set temporary password for the given login ID of user.
     * Note: The password will automatically be set as expired.
     * The user will not be able to log-in with this password, and will be required to replace it on next login.
     * See also: expirePassword
     * @param loginId The login ID of the user
     * @param password The password to set for the user
     */
    setTemporaryPassword: (loginId: string, password: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        httpClient.post(apiPaths.user.setTemporaryPassword, { loginId, password }),
        (data) => data,
      ),

    /**
     * Set password for the given login ID of user.
     * @param loginId The login ID of the user
     * @param password The password to set for the user
     */
    setActivePassword: (loginId: string, password: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        httpClient.post(apiPaths.user.setActivePassword, { loginId, password }),
        (data) => data,
      ),

    /** Deprecated (user setTemporaryPassword instead)
     * Set password for the given login ID of user.
     * Note: The password will automatically be set as expired.
     * The user will not be able to log-in with this password, and will be required to replace it on next login.
     * See also: expirePassword
     * @param loginId The login ID of the user
     * @param password The password to set for the user
     */
    setPassword: (loginId: string, password: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        httpClient.post(apiPaths.user.setPassword, { loginId, password }),
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
        httpClient.post(apiPaths.user.expirePassword, { loginId }),
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
        httpClient.post(apiPaths.user.removeAllPasskeys, { loginId }),
        (data) => data,
      ),

    /**
     * Removes TOTP seed for the user with the given login ID.
     * Note: The user might not be able to login anymore if they have no other authentication
     * methods or a verified email/phone.
     * @param loginId The login ID of the user
     */
    removeTOTPSeed: (loginId: string): Promise<SdkResponse<never>> =>
      transformResponse<never>(
        httpClient.post(apiPaths.user.removeTOTPSeed, { loginId }),
        (data) => data,
      ),

    /**
     * Retrieve users' authentication history, by the given user's ids.
     * @param userIds The user IDs
     */
    history: (userIds: string[]): Promise<SdkResponse<UserHistoryResponse[]>> =>
      transformResponse<UserHistoryResponse[]>(
        httpClient.post(apiPaths.user.history, userIds),
        (data) => data,
      ),
  };
};

export interface PatchUserOptions {
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
  ssoAppIds?: string[];
  scim?: boolean;
  status?: UserStatus;
}

export default withUser;
