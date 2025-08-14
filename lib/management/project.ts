import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  CloneProjectResponse,
  ExportSnapshotResponse,
  ImportSnapshotRequest,
  Project,
  ProjectEnvironment,
  ValidateSnapshotRequest,
  ValidateSnapshotResponse,
} from './types';

type ListProjectsResponse = {
  projects: Project[];
};

const withProject = (httpClient: HttpClient) => ({
  /**
   * Update the current project name.
   * @param name The new name of the project
   */
  updateName: (name: string): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.project.updateName, {
        name,
      }),
    ),

  /**
   * Update the current project tags.
   * @param tags The wanted tags
   */
  updateTags: (tags: string[]): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.project.updateTags, {
        tags,
      }),
    ),
  /**
   * Clone the current project, including its settings and configurations.
   *  - This action is supported only with a pro license or above.
   *  - Users, tenants and access keys are not cloned.
   * @param name The name of the new project
   * @param environment Determine if the project is in production or not.
   * @param tags array of free text tags
   * @returns The new project details (name, id, environment and tags)
   */
  clone: (
    name: string,
    environment?: ProjectEnvironment,
    tags?: string[],
  ): Promise<SdkResponse<CloneProjectResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.project.clone, {
        name,
        environment,
        tags,
      }),
    ),

  /**
   * list of all the projects in the company
   * @returns List of projects details (name, id, environment and tags)
   */
  listProjects: async (): Promise<SdkResponse<Project[]>> =>
    transformResponse<ListProjectsResponse, Project[]>(
      httpClient.post(apiPaths.project.projectsList, {}),
      (data) =>
        data.projects.map(({ id, name, environment, tags }) => ({
          id,
          name,
          environment,
          tags,
        })),
    ),

  /**
   *
   * Exports a snapshot of all the settings and configurations for a project and returns
   * the raw JSON files as a mape. Note that users, tenants and access keys are not exported.
   *
   * This call is supported only with a pro license or above.
   *
   * Note: The values for secrets such as tokens and keys are left blank in the snapshot.
   * When a snapshot is imported into a project, the secrets for entities that already
   * exist such as connectors or OAuth providers are preserved if the matching values
   * in the snapshot are left blank. See below for more details.
   *
   * This API is meant to be used via the 'descope' CLI tool that can be
   * found at https://github.com/descope/descopecli
   *
   * @returns An `ExportSnapshotResponse` object containing the exported JSON files.
   */
  exportSnapshot: (): Promise<SdkResponse<ExportSnapshotResponse>> =>
    transformResponse(httpClient.post(apiPaths.project.exportSnapshot, {})),

  /**
   * Imports a snapshot of all settings and configurations into a project, overriding any
   * current configuration.
   *
   * This call is supported only with a pro license or above.
   *
   * The request is expected to be an `ImportSnapshotRequest` object with a raw JSON map of
   * files in the same format as the one returned in the `files` field of an `exportSnapshot`
   * response.
   *
   * Note: The values for secrets such as tokens and keys are left blank in exported
   * snapshots. When a snapshot is imported into a project, the secrets for entities that
   * already exist such as connectors or OAuth providers are preserved if the matching values
   * in the snapshot are left blank. However, new entities that need to be created during
   * the import operation must any required secrets provided in the request, otherwise the
   * import operation will fail. The ValidateImport method can be used to get a human and
   * machine readable JSON of missing secrets that be passed to the ImportSnapshot call.
   *
   * This API is meant to be used via the 'descope' CLI tool that can be
   * found at https://github.com/descope/descopecli
   */
  importSnapshot: (request: ImportSnapshotRequest): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.project.importSnapshot, request)),

  /**
   * Validates a snapshot by performing an import dry run and reporting any validation
   * failures or missing data. This should be called right before `importSnapshot` to
   * minimize the risk of the import failing.
   *
   * This call is supported only with a pro license or above.
   *
   * The response will have `ok: true` if the validation passes. Otherwise, a list of
   * failures will be provided in the `failures` field, and any missing secrets will
   * be listed along with details about which entity requires them.
   *
   * Validation can be retried by setting the required cleartext secret values in the
   * `value` field of each missing secret and setting this object as the `inputSecrets`
   * field of the validate request. The same `inputSecrets` object should then be
   * provided to the `importSnapshot` call afterwards so it doesn't fail as well.
   *
   * This API is meant to be used via the 'descope' CLI tool that can be
   * found at https://github.com/descope/descopecli
   */
  validateSnapshot: (
    request: ValidateSnapshotRequest,
  ): Promise<SdkResponse<ValidateSnapshotResponse>> =>
    transformResponse(httpClient.post(apiPaths.project.validateSnapshot, request)),

  /**
   * @deprecated Use exportSnapshot instead
   */
  export: (): Promise<SdkResponse<Record<string, any>>> =>
    transformResponse(httpClient.post(apiPaths.project.exportSnapshot, {}), (data) => data.files),

  /**
   * @deprecated Use importSnapshot instead
   */
  import: (files: Record<string, any>): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.project.importSnapshot, {
        files,
      }),
    ),
});

export default withProject;
