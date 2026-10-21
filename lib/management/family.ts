import { SdkResponse, transformResponse, HttpClient, UserResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  Family,
  AttributesTypes,
  FamilySettings,
  FamilySearchOptions,
  CreateFamilyDependentOptions,
  UpdateJWTResponse,
  SingleUserResponse,
} from './types';
import { withCustomAttributes } from './helpers';

type SingleFamilyResponse = {
  family: Family;
};

type MultipleFamilyResponse = {
  families: Family[];
};

const withFamily = (httpClient: HttpClient) => {
  const createFamily = (
    id: string | undefined,
    name: string,
    customAttributes?: Record<string, AttributesTypes>,
    photo?: string,
    disabled?: boolean,
  ): Promise<SdkResponse<Family>> =>
    transformResponse<SingleFamilyResponse, Family>(
      httpClient.post(apiPaths.family.create, {
        familyId: id,
        name,
        customAttributes,
        photo,
        disabled,
      }),
      (data) => data.family,
    );

  const familyCustomAttributes = withCustomAttributes(httpClient, {
    get: apiPaths.family.getCustomAttributes,
    create: apiPaths.family.createCustomAttributes,
    delete: apiPaths.family.deleteCustomAttributes,
  });

  return {
    /** Create a new family. The family ID is generated automatically. */
    create: (
      name: string,
      customAttributes?: Record<string, AttributesTypes>,
      photo?: string,
      disabled?: boolean,
    ): Promise<SdkResponse<Family>> =>
      createFamily(undefined, name, customAttributes, photo, disabled),
    /** Create a new family with the given ID. */
    createWithId: (
      id: string,
      name: string,
      customAttributes?: Record<string, AttributesTypes>,
      photo?: string,
      disabled?: boolean,
    ): Promise<SdkResponse<Family>> => createFamily(id, name, customAttributes, photo, disabled),
    /**
     * Update will override all provided fields as is. Omitted fields are left unchanged.
     * customAttributes replaces all of the family's custom attributes, it is not merged.
     */
    update: (
      id: string,
      name?: string,
      customAttributes?: Record<string, AttributesTypes>,
      photo?: string,
      disabled?: boolean,
    ): Promise<SdkResponse<Family>> =>
      transformResponse<SingleFamilyResponse, Family>(
        httpClient.post(apiPaths.family.update, { id, name, customAttributes, photo, disabled }),
        (data) => data.family,
      ),
    /** Family deletion cannot be undone. Use carefully. */
    delete: (id: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.family.delete, { id })),
    /** Search families according to various parameters. Called with no options, returns all families. */
    searchAll: (options?: FamilySearchOptions): Promise<SdkResponse<Family[]>> =>
      transformResponse<MultipleFamilyResponse, Family[]>(
        httpClient.post(apiPaths.family.search, {
          familyIds: options?.ids,
          familyNames: options?.names,
          freeText: options?.text,
          customAttributes: options?.customAttributes,
          page: options?.page,
          size: options?.size,
        }),
        (data) => data.families,
      ),
    /** Create a dependent (shadow profile) user in a family - a user with no login credentials of their own. */
    createDependent: (
      familyId: string,
      options?: CreateFamilyDependentOptions,
    ): Promise<SdkResponse<UserResponse>> => {
      const { familyScopedAttributes, ...rest } = options ?? {};
      return transformResponse<SingleUserResponse, UserResponse>(
        httpClient.post(apiPaths.family.dependent.create, {
          familyId,
          ...rest,
          familyScopedAttributes: familyScopedAttributes
            ? { [familyId]: familyScopedAttributes }
            : undefined,
        }),
        (data) => data.user,
      );
    },
    /** Delete a dependent user. The family is inferred from the dependent. Regular (non-dependent)
     * family members are removed via `user.removeFamilies`, not deleted. */
    deleteDependent: (userId: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.family.dependent.delete, { userId })),
    /**
     * Impersonate a family dependent. The impersonator (by user ID or login ID) must be a member of
     * the dependent's family and hold the family impersonate-dependents permission there.
     * @param selectedFamily optional family to scope the impersonated session to (stamped as the
     *  current-family claim); when set it must be the dependent's family.
     */
    impersonateDependent: (
      impersonatorUserIdOrLoginId: string,
      dependentLoginId: string,
      selectedFamily?: string,
    ): Promise<SdkResponse<UpdateJWTResponse>> =>
      transformResponse(
        httpClient.post(apiPaths.family.impersonate, {
          impersonatorUserIdOrLoginId,
          dependentLoginId,
          selectedFamily,
        }),
      ),
    /** Stop impersonating a family dependent and return to the acting admin's own session. */
    stopImpersonation: (
      jwt: string,
      customClaims?: Record<string, any>,
      refreshDuration?: number,
    ): Promise<SdkResponse<UpdateJWTResponse>> =>
      transformResponse(
        httpClient.post(apiPaths.family.stopImpersonation, { jwt, customClaims, refreshDuration }),
      ),

    /** Get the project's family account settings. */
    getSettings: (): Promise<SdkResponse<FamilySettings>> =>
      transformResponse<FamilySettings, FamilySettings>(
        httpClient.get(apiPaths.family.settings),
        (data) => data,
      ),

    /**
     * Configure the project's family account settings. Omitted fields are left unchanged.
     * @param settings The settings to set
     * @returns The updated settings
     */
    configureSettings: (settings: FamilySettings): Promise<SdkResponse<FamilySettings>> =>
      transformResponse<FamilySettings, FamilySettings>(
        httpClient.post(apiPaths.family.settings, settings),
        (data) => data,
      ),

    /**
     * Get the custom attributes schema defined on the family entity itself. These are distinct from
     * the family-scoped user attributes managed through `user.getFamilyScopedCustomAttributes`.
     * @returns An array of CustomAttribute definitions
     */
    getCustomAttributes: familyCustomAttributes.get,

    /**
     * Create custom attribute definitions on the family entity.
     * @param attributes The custom attribute definitions to create
     * @returns The updated array of CustomAttribute definitions
     */
    createCustomAttributes: familyCustomAttributes.create,

    /**
     * Delete custom attribute definitions from the family entity by name.
     * @param names The names of the custom attributes to delete
     * @returns The updated array of CustomAttribute definitions
     */
    deleteCustomAttributes: familyCustomAttributes.delete,
  };
};

export default withFamily;
