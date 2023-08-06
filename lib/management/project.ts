import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';

const withProject = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Update the current project.
   * Note that currently we only support updating the project name.
   * But this may change in the future to support more fields.
   * @param name Project name
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
});

export default withProject;
