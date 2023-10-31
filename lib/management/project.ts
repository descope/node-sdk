import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { NewProjectResponse, ProjectTag } from './types';

const withProject = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Update the current project name.
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
