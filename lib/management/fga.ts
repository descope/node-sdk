import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import fetch from '../fetch-polyfill';
import apiPaths from './paths';
import {
  CheckResponseRelation,
  FGARelation,
  FGASchema,
  FGAResourceDetails,
  FGAResourceIdentifier,
  FGAConfig,
} from './types';

const DEFAULT_CACHE_TIMEOUT_MS = 5000;

const WithFGA = (httpClient: HttpClient, config?: FGAConfig) => {
  const postWithOptionalCache = async (path: string, body: unknown): Promise<Response> => {
    if (config?.fgaCacheUrl && config.managementKey) {
      const url = `${config.fgaCacheUrl}${path}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_CACHE_TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...config.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.projectId}:${config.managementKey}`,
            'x-descope-project-id': config.projectId,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch {
        return httpClient.post(path, body);
      }
    }
    return httpClient.post(path, body);
  };

  return {
    /**
     * Save (create or update) the given schema.
     * In case of update, will update only given namespaces and will not delete namespaces unless upgrade flag is true.
     *
     * @param schema the schema to save
     * @returns standard success or failure response
     */
    saveSchema: (schema: FGASchema): Promise<SdkResponse<never>> =>
      transformResponse(postWithOptionalCache(apiPaths.fga.schema, schema)),
    /**
     * Delete the schema for the project which will also delete all relations.
     *
     * @returns standard success or failure response
     */
    deleteSchema: (): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.schemaDelete, {})),
    /**
     * Create the given relations.
     *
     * @param relations to create.
     * @returns standard success or failure response
     */
    createRelations: (relations: FGARelation[]): Promise<SdkResponse<never>> =>
      transformResponse(postWithOptionalCache(apiPaths.fga.relations, { tuples: relations })),

    /**
     * Delete the given relations.
     * This is a bulk operation and will delete all the given relations.
     *
     * @param relations to delete.
     * @returns standard success or failure response
     */

    deleteRelations: (relations: FGARelation[]): Promise<SdkResponse<never>> =>
      transformResponse(postWithOptionalCache(apiPaths.fga.deleteRelations, { tuples: relations })),

    /**
     * Check if the given relations exist.
     * This is a read-only operation and will not create any relations.
     * It will return the relations with the boolean flag indicating if relation exists.
     * This is useful to check if a relation exists before creating it.
     *
     * @param relations to check.
     * @returns array of relations with the boolean flag indicating if relation exists
     */
    check: (relations: FGARelation[]): Promise<SdkResponse<CheckResponseRelation[]>> =>
      transformResponse(
        postWithOptionalCache(apiPaths.fga.check, { tuples: relations }),
        (data) => data.tuples,
      ),

    /**
     * Load details for the given resource identifiers.
     * @param resourceIdentifiers the resource identifiers (resourceId and resourceType tuples) to load details for
     */
    loadResourcesDetails: (
      resourceIdentifiers: FGAResourceIdentifier[],
    ): Promise<SdkResponse<FGAResourceDetails[]>> =>
      transformResponse(
        httpClient.post(apiPaths.fga.resourcesLoad, { resourceIdentifiers }),
        (data) => data.resourcesDetails,
      ),

    /**
     * Save details for the given resources.
     * @param resourcesDetails the resources details to save
     */
    saveResourcesDetails: (resourcesDetails: FGAResourceDetails[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.fga.resourcesSave, { resourcesDetails })),

    /**
     * Delete all relations.
     *
     * @returns standard success or failure response
     */
    deleteAllRelations: (): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.delete(apiPaths.fga.relations)),
  };
};

export default WithFGA;
