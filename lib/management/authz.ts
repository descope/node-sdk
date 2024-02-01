import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  AuthzSchema,
  AuthzNamespace,
  AuthzRelationDefinition,
  AuthzRelation,
  AuthzRelationQuery,
  AuthzModified,
} from './types';

const WithAuthz = (sdk: CoreSdk, managementKey?: string) => ({
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
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.schemaSave, { schema, upgrade }, { token: managementKey }),
    ),
  /**
   * Delete the schema for the project which will also delete all relations.
   *
   * @returns standard success or failure response
   */
  deleteSchema: (): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.schemaDelete, {}, { token: managementKey }),
    ),
  /**
   * Load the schema for the project.
   *
   * @returns the schema associated with the project
   */
  loadSchema: (): Promise<SdkResponse<AuthzSchema>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.schemaLoad, {}, { token: managementKey }),
      (data) => data.schema,
    ),
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
    transformResponse(
      sdk.httpClient.post(
        apiPaths.authz.nsSave,
        { namespace, oldName, schemaName },
        { token: managementKey },
      ),
    ),
  /**
   * Delete the given namespace.
   * Will also delete the relevant relations.
   *
   * @param name to delete.
   * @param schemaName optional and used to track the current schema version.
   * @returns standard success or failure response
   */
  deleteNamespace: (name: string, schemaName?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.nsDelete, { name, schemaName }, { token: managementKey }),
    ),
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
      sdk.httpClient.post(
        apiPaths.authz.rdSave,
        { relationDefinition, namespace, oldName, schemaName },
        { token: managementKey },
      ),
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
    transformResponse(
      sdk.httpClient.post(
        apiPaths.authz.rdDelete,
        { name, namespace, schemaName },
        { token: managementKey },
      ),
    ),
  /**
   * Create the given relations.
   *
   * @param relations to create.
   * @returns standard success or failure response
   */
  createRelations: (relations: AuthzRelation[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.reCreate, { relations }, { token: managementKey }),
    ),
  /**
   * Delete the given relations.
   *
   * @param relations to delete.
   * @returns standard success or failure response
   */
  deleteRelations: (relations: AuthzRelation[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.reDelete, { relations }, { token: managementKey }),
    ),
  /**
   * Delete the relations for the given resources.
   *
   * @param resources resources to delete relations for.
   * @returns standard success or failure response
   */
  deleteRelationsForResources: (resources: string[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.authz.reDeleteResources,
        { resources },
        { token: managementKey },
      ),
    ),
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
      sdk.httpClient.post(
        apiPaths.authz.hasRelations,
        { relationQueries },
        { token: managementKey },
      ),
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
      sdk.httpClient.post(
        apiPaths.authz.who,
        { resource, relationDefinition, namespace },
        { token: managementKey },
      ),
      (data) => data.targets,
    ),
  /**
   * Return the list of all defined relations (not recursive) on the given resource.
   *
   * @param resource The resource we are checking
   * @returns array of relations that exist for the given resource
   */
  resourceRelations: (resource: string): Promise<SdkResponse<AuthzRelation[]>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.resource, { resource }, { token: managementKey }),
      (data) => data.relations,
    ),
  /**
   * Return the list of all defined relations (not recursive) for the given targets.
   *
   * @param targets array of targets we want to check
   * @returns array of relations that exist for the given targets
   */
  targetsRelations: (targets: string[]): Promise<SdkResponse<AuthzRelation[]>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.authz.targets, { targets }, { token: managementKey }),
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
      sdk.httpClient.post(apiPaths.authz.targetAll, { target }, { token: managementKey }),
      (data) => data.relations,
    ),
  /**
   * Return the list of all relations for the given target including derived relations from the schema tree.
   *
   * @param target The target to check relations for
   * @returns array of relations that exist for the given targets
   */
  getModified: (since: Date): Promise<SdkResponse<AuthzModified>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.authz.getModified,
        { since: since ? since.getTime() : 0 },
        { token: managementKey },
      ),
      (data) => data as AuthzModified,
    ),
});

export default WithAuthz;
