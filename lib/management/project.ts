import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CloneProjectResponse, Project, ProjectTag } from './types';

type ListProjectsResponse = {
  projects: Project[];
};

const withProject = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Update the current project name.
   * @param name The new name of the project
   */
  updateName: (name: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.project.updateName,
        {
          name,
        },
        { token: managementKey },
      ),
    ),

  /**
   * Update the current project tags.
   * @param tags The wanted tags
   */
  updateTags: (tags: string[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.project.updateTags,
        {
          tags,
        },
        { token: managementKey },
      ),
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
    environment?: ProjectTag,
    tags?: string[],
  ): Promise<SdkResponse<CloneProjectResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.project.clone,
        {
          name,
          environment,
          tags,
        },
        { token: managementKey },
      ),
    ),

  /**
   * list of all the projects in the company
   * @returns List of projects details (name, id, environment and tags)
   */
  listProjects: async (): Promise<SdkResponse<Project[]>> =>
    transformResponse<ListProjectsResponse, Project[]>(
      sdk.httpClient.post(
        apiPaths.project.projectsList,
        {},
        {
          token: managementKey,
        },
      ),
      (data) =>
        data.projects.map(({ id, name, environment, tags }) => ({
          id,
          name,
          environment,
          tags,
        })),
    ),

  /**
   * Exports all settings and configurations for a project and returns the
   * raw JSON files response as an object.
   *  - This action is supported only with a pro license or above.
   *  - Users, tenants and access keys are not cloned.
   *  - Secrets, keys and tokens are not stripped from the exported data.
   *
   * @returns An object containing the exported JSON files payload.
   */
  export: (): Promise<SdkResponse<Record<string, any>>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.project.export, {}, { token: managementKey }),
      (data) => data.files,
    ),

  /**
   * Imports all settings and configurations for a project overriding any
   * current configuration.
   *  - This action is supported only with a pro license or above.
   *  - Secrets, keys and tokens are not overwritten unless overwritten in the input.
   *
   * @param files The raw JSON dictionary of files, in the same format as
   *        the one returned by calls to export.
   */
  import: (files: Record<string, any>): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.project.import,
        {
          files,
        },
        { token: managementKey },
      ),
    ),
});

export default withProject;
