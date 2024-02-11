import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { PasswordSettings } from './types';

const withPassword = (sdk: CoreSdk, managementKey?: string) => ({
  getSettings: (tenantId: string): Promise<SdkResponse<PasswordSettings>> =>
    transformResponse<PasswordSettings, PasswordSettings>(
      sdk.httpClient.get(apiPaths.password.settings, {
        queryParams: { tenantId },
        token: managementKey,
      }),
      (data) => data,
    ),
  configureSettings: (tenantId: string, settings: PasswordSettings): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.password.settings,
        { ...settings, tenantId },
        {
          token: managementKey,
        },
      ),
    ),
});

export default withPassword;
