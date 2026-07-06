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
  FGASchemaDryRunResponse,
  FGAMappableSchema,
  FGAMappableResources,
  FGAMappableResourcesQuery,
  FGAMappableResourcesOptions,
} from './types';

const DEFAULT_CACHE_TIMEOUT_MS = 30000;

const WithFGA = (httpClient: HttpClient, config?: FGAConfig) => {
  const rawTimeout = config?.fgaCacheTimeoutMs ?? DEFAULT_CACHE_TIMEOUT_MS;
  const cacheTimeoutMs =
    Number.isFinite(rawTimeout) && rawTimeout > 0 ? rawTimeout : DEFAULT_CACHE_TIMEOUT_MS;

  const postWithOptionalCache = async (path: string, body: unknown): Promise<Response> => {
    if (config?.fgaCacheUrl && config.managementKey) {
      const url = `${config.fgaCacheUrl}${path}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), cacheTimeoutMs);

      try {
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

        if (response.ok) {
          // Pre-consume body to avoid node-fetch clone issues
          // (same workaround as fetchWrapper in core-js-sdk)
          const respText = await response.text();
          (response as any).text = () => Promise.resolve(respText);
          (response as any).json = async () => JSON.parse(respText);
          (response as any).clone = () => response;
          return response;
        }
      } catch {
        // Cache request failed (network error or timeout); fall back to origin
      } finally {
        clearTimeout(timeoutId);
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
     * Load the schema for the project.
     *
     * @returns the schema associated with the project
     */
    loadSchema: (): Promise<SdkResponse<FGASchema>> =>
      transformResponse<FGASchema, FGASchema>(
        httpClient.get(apiPaths.fga.schema, {}),
        (data) => data,
      ),
    /**
     * Validate the given schema without saving it and return what would be deleted from the current schema.
     *
     * @param schema the schema to dry run
     * @returns the dry run response describing what would be deleted
     */
    dryRunSchema: (schema: FGASchema): Promise<SdkResponse<FGASchemaDryRunResponse>> =>
      transformResponse<FGASchemaDryRunResponse, FGASchemaDryRunResponse>(
        httpClient.post(apiPaths.fga.dryRunSchema, schema),
        (data) => data,
      ),
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
     * Check if the given relations exist, additionally threading a caller-supplied context map
     * to CEL conditions defined in the schema.
     * This is a read-only operation and will not create any relations.
     *
     * @param relations to check.
     * @param context extra context to supply to condition evaluation (optional).
     * @returns array of relations with the boolean flag indicating if relation exists
     */
    checkWithContext: (
      relations: FGARelation[],
      context?: Record<string, any>,
    ): Promise<SdkResponse<CheckResponseRelation[]>> =>
      transformResponse(
        postWithOptionalCache(apiPaths.fga.check, {
          tuples: relations,
          ...(context && Object.keys(context).length > 0 ? { context } : {}),
        }),
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
     * Load the mappable schema for the project (only listing the relation definitions for a namespace),
     * along with a list of mappable resources.
     *
     * @param tenantId the tenant to load the mappable schema for
     * @param options optional settings such as the resources limit
     * @returns the mappable schema and mappable resources
     */
    loadMappableSchema: (
      tenantId: string,
      options?: FGAMappableResourcesOptions,
    ): Promise<SdkResponse<FGAMappableSchema>> =>
      transformResponse<FGAMappableSchema, FGAMappableSchema>(
        httpClient.get(apiPaths.fga.mappableSchema, {
          queryParams: {
            tenantId,
            ...(options?.resourcesLimit && options.resourcesLimit > 0
              ? { resourcesLimit: options.resourcesLimit.toString() }
              : {}),
          },
        }),
        (data) => data,
      ),

    /**
     * Search for mappable resources based on the given queries.
     *
     * @param tenantId the tenant to search mappable resources for
     * @param resourcesQueries the queries (per type) to search with
     * @param options optional settings such as the resources limit
     * @returns array of mappable resources matching the given queries
     */
    searchMappableResources: (
      tenantId: string,
      resourcesQueries: FGAMappableResourcesQuery[],
      options?: FGAMappableResourcesOptions,
    ): Promise<SdkResponse<FGAMappableResources[]>> =>
      transformResponse(
        httpClient.post(apiPaths.fga.mappableResources, {
          tenantId,
          resourcesQueries,
          ...(options?.resourcesLimit && options.resourcesLimit > 0
            ? { resourcesLimit: options.resourcesLimit.toString() }
            : {}),
        }),
        (data) => data.mappableResources,
      ),

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
