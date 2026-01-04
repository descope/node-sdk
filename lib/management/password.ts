import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { PasswordSettings } from './types';

const withPassword = (httpClient: HttpClient) => ({
  getSettings: (tenantId: string): Promise<SdkResponse<PasswordSettings>> =>
    transformResponse<PasswordSettings, PasswordSettings>(
      httpClient.get(apiPaths.password.settings, {
        queryParams: { tenantId },
      }),
      (data) => data,
    ),
  configureSettings: (tenantId: string, settings: PasswordSettings): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.password.settings, { ...settings, tenantId })),
});

export default withPassword;
