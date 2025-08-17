import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { AccessKey, AssociatedTenant, CreatedAccessKeyResponse } from './types';

type SingleKeyResponse = {
  key: AccessKey;
};

type MultipleKeysResponse = {
  keys: AccessKey[];
};

const withAccessKey = (httpClient: HttpClient) => ({
  /**
   * Create a new access key for a project.
   * @param name Access key name
   * @param expireTime When the access key expires. Keep at 0 to make it indefinite.
   * @param roles Optional roles in the project. Does not apply for multi-tenants
   * @param tenants Optional associated tenants for this key and its roles for each.
   * @param userId Optional bind this access key to a specific user.
   * @param customClaims Optional map of claims and their values that will be present in the JWT.
   * @param description Optional free text description
   * @param permittedIps Optional list of IP addresses or CIDR ranges that are allowed to use this access key.
   * @returns A newly created key and its cleartext. Make sure to save the cleartext securely.
   */
  create: (
    name: string,
    expireTime: number,
    roles?: string[],
    tenants?: AssociatedTenant[],
    userId?: string,
    customClaims?: Record<string, any>,
    description?: string,
    permittedIps?: string[],
  ): Promise<SdkResponse<CreatedAccessKeyResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.accessKey.create, {
        name,
        expireTime,
        roleNames: roles,
        keyTenants: tenants,
        userId,
        customClaims,
        description,
        permittedIps,
      }),
    ),
  /**
   * Load an access key.
   * @param id Access key ID to load
   * @returns The loaded access key.
   */
  load: (id: string): Promise<SdkResponse<AccessKey>> =>
    transformResponse<SingleKeyResponse, AccessKey>(
      httpClient.get(apiPaths.accessKey.load, {
        queryParams: { id },
      }),
      (data) => data.key,
    ),
  /**
   * Search all access keys
   * @param tenantIds Optional tenant ID filter to apply on the search results
   * @returns An array of found access keys
   */
  searchAll: (tenantIds?: string[]): Promise<SdkResponse<AccessKey[]>> =>
    transformResponse<MultipleKeysResponse, AccessKey[]>(
      httpClient.post(apiPaths.accessKey.search, { tenantIds }),
      (data) => data.keys,
    ),
  /**
   * Update an access key.
   * @param id Access key ID to load
   * @param name The updated access key name
   * @param description Optional updated access key description
   * @param roles Optional roles in the project. Does not apply for multi-tenants
   * @param tenants Optional associated tenants for this key and its roles for each.
   * @param customClaims Optional map of claims and their values that will be present in the JWT.
   * @param permittedIps Optional list of IP addresses or CIDR ranges that are allowed to use this access key.
   * @returns The updated access key
   */
  update: (
    id: string,
    name: string,
    description?: string,
    roles?: string[],
    tenants?: AssociatedTenant[],
    customClaims?: Record<string, any>,
    permittedIps?: string[],
  ): Promise<SdkResponse<AccessKey>> =>
    transformResponse<SingleKeyResponse, AccessKey>(
      httpClient.post(apiPaths.accessKey.update, {
        id,
        name,
        description,
        roleNames: roles,
        keyTenants: tenants,
        customClaims,
        permittedIps,
      }),
      (data) => data.key,
    ),
  /**
   * Deactivate an access key. Deactivated access keys cannot be used until they are
   * activated again.
   * @param id Access key ID to deactivate
   */
  deactivate: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.accessKey.deactivate, { id })),
  /**
   * Activate an access key. Only deactivated access keys can be activated again.
   * @param id Access key ID to activate
   */
  activate: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.accessKey.activate, { id })),
  /**
   * Delete an access key. IMPORTANT: This cannot be undone. Use carefully.
   * @param id Access key ID to delete
   */
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.accessKey.delete, { id })),
});

export default withAccessKey;
