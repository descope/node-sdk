import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { AccessKey, AssociatedTenant, CreatedAccessKeyResponse } from './types';

type SingleKeyResponse = {
  key: AccessKey;
};

type MultipleKeysResponse = {
  keys: AccessKey[];
};

const withAccessKey = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Create a new access key for a project.
   * @param name Access key name
   * @param expireTime When the access key expires. Keep at 0 to make it indefinite.
   * @param roles Optional roles in the project. Does not apply for multi-tenants
   * @param keyTenants Optional associated tenants for this key and its roles for each.
   * @param userId Optional bind this access key to a specific user.
   * @param customClaims Optional map of claims and their values that will be present in the JWT.
   * @returns A newly created key and its cleartext. Make sure to save the cleartext securely.
   */
  create: (
    name: string,
    expireTime: number,
    roles?: string[],
    keyTenants?: AssociatedTenant[],
    userId?: string,
    customClaims?: Record<string, any>,
    description?: string,
  ): Promise<SdkResponse<CreatedAccessKeyResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.accessKey.create,
        { name, expireTime, roleNames: roles, keyTenants, userId, customClaims, description },
        { token: managementKey },
      ),
    ),
  /**
   * Load an access key.
   * @param id Access key ID to load
   * @returns The loaded access key.
   */
  load: (id: string): Promise<SdkResponse<AccessKey>> =>
    transformResponse<SingleKeyResponse, AccessKey>(
      sdk.httpClient.get(apiPaths.accessKey.load, {
        queryParams: { id },
        token: managementKey,
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
      sdk.httpClient.post(apiPaths.accessKey.search, { tenantIds }, { token: managementKey }),
      (data) => data.keys,
    ),
  /**
   * Update an access key.
   * @param id Access key ID to load
   * @param name The updated access key name
   * @param description The updated access key description
   * @returns The updated access key
   */
  update: (id: string, name: string, description?: string): Promise<SdkResponse<AccessKey>> =>
    transformResponse<SingleKeyResponse, AccessKey>(
      sdk.httpClient.post(
        apiPaths.accessKey.update,
        { id, name, description },
        { token: managementKey },
      ),
      (data) => data.key,
    ),
  /**
   * Deactivate an access key. Deactivated access keys cannot be used until they are
   * activated again.
   * @param id Access key ID to deactivate
   */
  deactivate: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.accessKey.deactivate, { id }, { token: managementKey }),
    ),
  /**
   * Activate an access key. Only deactivated access keys can be activated again.
   * @param id Access key ID to activate
   */
  activate: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.accessKey.activate, { id }, { token: managementKey }),
    ),
  /**
   * Delete an access key. IMPORTANT: This cannot be undone. Use carefully.
   * @param id Access key ID to delete
   */
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.accessKey.delete, { id }, { token: managementKey }),
    ),
});

export default withAccessKey;
