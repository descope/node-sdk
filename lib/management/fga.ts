import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CheckResponseRelation, FGARelation, FGASchema } from './types';

const WithFGA = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Save (create or update) the given schema.
   * In case of update, will update only given namespaces and will not delete namespaces unless upgrade flag is true.
   *
   * @param schema the schema to save
   * @returns standard success or failure response
   */
  saveSchema: (schema: FGASchema): Promise<SdkResponse<never>> =>
    transformResponse(sdk.httpClient.post(apiPaths.fga.schema, schema, { token: managementKey })),
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
   * Create the given relations.
   *
   * @param relations to create.
   * @returns standard success or failure response
   */
  createRelations: (relations: FGARelation[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.fga.relations, { tuples: relations }, { token: managementKey }),
    ),
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
      sdk.httpClient.post(apiPaths.fga.check, { tuples: relations }, { token: managementKey }),
      (data) => data.tuples,
    ),
});

export default WithFGA;
