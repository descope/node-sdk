import { SdkResponse, transformResponse, HttpClient, UserResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  Family,
  AttributesTypes,
  SearchFamiliesOptions,
  CreateFamilyDependentOptions,
  UpdateJWTResponse,
} from './types';

type SingleFamilyResponse = {
  family: Family;
};

type MultipleFamilyResponse = {
  families: Family[];
};

type SingleUserResponse = {
  user: UserResponse;
};

const withFamily = (httpClient: HttpClient) => ({
  create: (
    name: string,
    customAttributes?: Record<string, AttributesTypes>,
    photo?: string,
    disabled?: boolean,
    // Optional caller-supplied family ID; a random one is generated when omitted.
    familyId?: string,
  ): Promise<SdkResponse<Family>> =>
    transformResponse<SingleFamilyResponse, Family>(
      httpClient.post(apiPaths.family.create, {
        name,
        customAttributes,
        photo,
        disabled,
        familyId,
      }),
      (data) => data.family,
    ),
  /** Update will override all provided fields as is. Omitted fields are left unchanged. */
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
  search: (options?: SearchFamiliesOptions): Promise<SdkResponse<Family[]>> =>
    transformResponse<MultipleFamilyResponse, Family[]>(
      httpClient.post(apiPaths.family.search, options ?? {}, {}),
      (data) => data.families,
    ),
  /** Create a dependent (shadow profile) user in a family - a user with no login credentials of their own. */
  createDependent: (
    familyId: string,
    options?: CreateFamilyDependentOptions,
  ): Promise<SdkResponse<UserResponse>> =>
    transformResponse<SingleUserResponse, UserResponse>(
      httpClient.post(apiPaths.family.dependent.create, { familyId, ...options }),
      (data) => data.user,
    ),
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
});

export default withFamily;
