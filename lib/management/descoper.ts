import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  Descoper,
  DescoperAttributes,
  DescoperCreate,
  DescoperRBAC,
  DescoperLoadOptions,
} from './types';

type DescoperCreateResponse = {
  descopers: Descoper[];
  total: number;
};

type DescoperGetResponse = {
  descoper: Descoper;
};

type DescoperUpdateResponse = {
  descoper: Descoper;
};

type DescoperListResponse = {
  descopers: Descoper[];
  total: number;
};

const withDescoper = (httpClient: HttpClient) => ({
  /**
   * Create new descoper(s)
   * @param descopers Array of descoper creation objects
   * @returns The newly created descopers and total count
   */
  create: (
    descopers: DescoperCreate[],
  ): Promise<SdkResponse<{ descopers: Descoper[]; total: number }>> =>
    transformResponse<DescoperCreateResponse, { descopers: Descoper[]; total: number }>(
      httpClient.put(apiPaths.descoper.create, { descopers }),
      (data) => ({ descopers: data.descopers, total: data.total }),
    ),

  /**
   * Update an existing descoper's attributes and/or RBAC
   * @param id The descoper ID
   * @param attributes Optional attributes to update
   * @param rbac Optional RBAC configuration to update
   * @returns The updated descoper
   */
  update: (
    id: string,
    attributes?: DescoperAttributes,
    rbac?: DescoperRBAC,
  ): Promise<SdkResponse<Descoper>> =>
    transformResponse<DescoperUpdateResponse, Descoper>(
      httpClient.patch(apiPaths.descoper.update, { id, attributes, rbac }),
      (data) => data.descoper,
    ),

  /**
   * Load a descoper by ID
   * @param id The descoper ID
   * @returns The descoper
   */
  load: (id: string): Promise<SdkResponse<Descoper>> =>
    transformResponse<DescoperGetResponse, Descoper>(
      httpClient.get(apiPaths.descoper.get, { queryParams: { id } }),
      (data) => data.descoper,
    ),

  /**
   * Delete a descoper by ID
   * @param id The descoper ID
   */
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.delete(apiPaths.descoper.delete, { queryParams: { id } })),

  /**
   * List all descopers
   * @param options Optional load options
   * @returns List of descopers and total count
   */
  loadAll: (
    options?: DescoperLoadOptions,
  ): Promise<SdkResponse<{ descopers: Descoper[]; total: number }>> =>
    transformResponse<DescoperListResponse, { descopers: Descoper[]; total: number }>(
      httpClient.post(apiPaths.descoper.list, { options }),
      (data) => ({ descopers: data.descopers, total: data.total }),
    ),
});

export default withDescoper;
