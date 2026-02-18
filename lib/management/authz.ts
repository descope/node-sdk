import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import fetch from '../fetch-polyfill';
import apiPaths from './paths';
import {
  AuthzSchema,
  AuthzNamespace,
  AuthzRelationDefinition,
  AuthzRelation,
  AuthzRelationQuery,
  AuthzModified,
  AuthzResource,
  FGAConfig,
} from './types';

const DEFAULT_CACHE_TIMEOUT_MS = 5000;

const WithAuthz = (httpClient: HttpClient, config?: FGAConfig) => {
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
     * Schema name can be used for projects to track versioning.
     *
     * @param schema the schema to save
     * @param upgrade should we upgrade existing schema or ignore any namespace not provided
     * @returns standard success or failure response
     */
    saveSchema: (schema: AuthzSchema, upgrade: boolean): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.schemaSave, { schema, upgrade })),
    /**
     * Delete the schema for the project which will also delete all relations.
     *
     * @returns standard success or failure response
     */
    deleteSchema: (): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.schemaDelete, {})),
    /**
     * Load the schema for the project.
     *
     * @returns the schema associated with the project
     */
    loadSchema: (): Promise<SdkResponse<AuthzSchema>> =>
      transformResponse(httpClient.post(apiPaths.authz.schemaLoad, {}), (data) => data.schema),
    /**
     * Save (create or update) the given namespace.
     * Will not delete relation definitions not mentioned in the namespace.
     *
     * @param namespace the namespace to save
     * @param oldName if we are changing the namespace name, what was the old name we are updating.
     * @param schemaName optional and used to track the current schema version.
     * @returns standard success or failure response
     */
    saveNamespace: (
      namespace: AuthzNamespace,
      oldName?: string,
      schemaName?: string,
    ): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.nsSave, { namespace, oldName, schemaName })),
    /**
     * Delete the given namespace.
     * Will also delete the relevant relations.
     *
     * @param name to delete.
     * @param schemaName optional and used to track the current schema version.
     * @returns standard success or failure response
     */
    deleteNamespace: (name: string, schemaName?: string): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.nsDelete, { name, schemaName })),
    /**
     * Save (create or update) the given relation definition.
     *
     * @param relationDefinition rd to save.
     * @param namespace that it belongs to.
     * @param oldName if we are changing the relation definition name, what was the old name we are updating.
     * @param schemaName optional and used to track the current schema version.
     * @returns standard success or failure response
     */
    saveRelationDefinition: (
      relationDefinition: AuthzRelationDefinition,
      namespace: string,
      oldName?: string,
      schemaName?: string,
    ): Promise<SdkResponse<never>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.rdSave, {
          relationDefinition,
          namespace,
          oldName,
          schemaName,
        }),
      ),
    /**
     * Delete the given relation definition.
     * Will also delete the relevant relations.
     *
     * @param name to delete.
     * @param namespace it belongs to.
     * @param schemaName optional and used to track the current schema version.
     * @returns standard success or failure response
     */
    deleteRelationDefinition: (
      name: string,
      namespace: string,
      schemaName?: string,
    ): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.rdDelete, { name, namespace, schemaName })),
    /**
     * Create the given relations.
     *
     * @param relations to create.
     * @returns standard success or failure response
     */
    createRelations: (relations: AuthzRelation[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.reCreate, { relations })),
    /**
     * Delete the given relations.
     *
     * @param relations to delete.
     * @returns standard success or failure response
     */
    deleteRelations: (relations: AuthzRelation[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.reDelete, { relations })),
    /**
     * @deprecated use `deleteRelationsForIds` instead for better clarity
     *
     * Delete any relations with matching resourceIds OR targetIds
     *
     * @param resources ids to delete relations for.
     * @returns standard success or failure response
     */
    deleteRelationsForResources: (resources: string[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.reDeleteResources, { resources })),
    /**
     *
     * Delete any relations with matching resourceIds
     *
     * @param resources resource ids to delete relations for.
     * @returns
     */
    deleteResourceRelationsForResources: (resources: string[]): Promise<SdkResponse<never>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.reDeleteResourceRelationsForResources, { resources }),
      ),
    /**
     * Delete any relations with matching resourceIds OR targetIds
     *
     * @param ids ids to delete relations for.
     * @returns standard success or failure response
     */
    deleteRelationsForIds: (ids: string[]): Promise<SdkResponse<never>> =>
      transformResponse(httpClient.post(apiPaths.authz.reDeleteResources, { resources: ids })),
    /**
     * Query relations to see what relations exists.
     *
     * @param relationQueries array of relation queries to check.
     * @returns array of relation query responses with the boolean flag indicating if relation exists
     */
    hasRelations: (
      relationQueries: AuthzRelationQuery[],
    ): Promise<SdkResponse<AuthzRelationQuery[]>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.hasRelations, { relationQueries }),
        (data) => data.relationQueries,
      ),
    /**
     * List all the users that have the given relation definition to the given resource.
     *
     * @param resource The resource we are checking
     * @param relationDefinition The relation definition we are querying
     * @param namespace The namespace for the relation definition
     * @returns array of users who have the given relation definition
     */
    whoCanAccess: (
      resource: string,
      relationDefinition: string,
      namespace: string,
    ): Promise<SdkResponse<string[]>> =>
      transformResponse(
        postWithOptionalCache(apiPaths.authz.who, { resource, relationDefinition, namespace }),
        (data) => data.targets,
      ),
    /**
     * Return the list of all defined relations (not recursive) on the given resource.
     *
     * @param resource The resource we are checking
     * @param ignoreTargetSetRelations if true, will not return target set relations even if they exist
     * @returns array of relations that exist for the given resource
     */
    resourceRelations: (
      resource: string,
      ignoreTargetSetRelations = false,
    ): Promise<SdkResponse<AuthzRelation[]>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.resource, { resource, ignoreTargetSetRelations }),
        (data) => data.relations,
      ),
    /**
     * Return the list of all defined relations (not recursive) for the given targets.
     *
     * @param targets array of targets we want to check
     * @param includeTargetSetRelations if true, will include target set relations as well as target relations
     * @returns array of relations that exist for the given targets
     */
    targetsRelations: (
      targets: string[],
      includeTargetSetRelations = false,
    ): Promise<SdkResponse<AuthzRelation[]>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.targets, { targets, includeTargetSetRelations }),
        (data) => data.relations,
      ),
    /**
     * Return the list of all relations for the given target including derived relations from the schema tree.
     *
     * @param target The target to check relations for
     * @returns array of relations that exist for the given targets
     */
    whatCanTargetAccess: (target: string): Promise<SdkResponse<AuthzRelation[]>> =>
      transformResponse(
        postWithOptionalCache(apiPaths.authz.targetAll, { target }),
        (data) => data.relations,
      ),

    /**
     * Return all resources which the target can access via relation paths that end with the given relation definition
     *
     * @param target The target to check resource access for, e.g. user:123
     * @param relationDefinition A relation on a resource, e.g. owner
     * @param namespace The namespace (type) of the resource in which the relation is defined, e.g. folder
     * @returns array of resources that the target can access on relation paths which include the given relation definition
     */
    whatCanTargetAccessWithRelation: (
      target: string,
      relationDefinition: string,
      namespace: string,
    ): Promise<SdkResponse<AuthzResource[]>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.targetWithRelation, {
          target,
          relationDefinition,
          namespace,
        }),
        (data) => data.resources.map((resource: string) => ({ resource })),
      ),

    /**
     * Return the list of all relations for the given target including derived relations from the schema tree.
     *
     * @param target The target to check relations for
     * @returns array of relations that exist for the given targets
     */
    getModified: (since: Date): Promise<SdkResponse<AuthzModified>> =>
      transformResponse(
        httpClient.post(apiPaths.authz.getModified, { since: since ? since.getTime() : 0 }),
        (data) => data as AuthzModified,
      ),
  };
};

export default WithAuthz;
