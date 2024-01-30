import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { CloneProjectResponse, ProjectTag } from './types';

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
   * Clone the current project, including its settings and configurations.
   *  - This action is supported only with a pro license or above.
   *  - Users, tenants and access keys are not cloned.
   * @param name The name of the new project
   * @param tag The tag of the new project
   * @returns The new project details (name, id, and tag)
   */
  clone: (name: string, tag?: ProjectTag): Promise<SdkResponse<CloneProjectResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.project.clone,
        {
          name,
          tag,
        },
        { token: managementKey },
      ),
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
        apiPaths.project.export,
        {
          files,
        },
        { token: managementKey },
      ),
    ),
});

export default withProject;
