import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { NewProjectResponse, ProjectTag } from './types';

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
   * @returns The new project details (name, id, tag, and settings)
   */
  clone: (name: string, tag?: ProjectTag): Promise<SdkResponse<NewProjectResponse>> =>
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
});

export default withProject;
