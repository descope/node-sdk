import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { Theme, ThemeResponse } from './types';

const WithTheme = (sdk: CoreSdk, managementKey?: string) => ({
  export: (): Promise<SdkResponse<ThemeResponse>> =>
    transformResponse(sdk.httpClient.post(apiPaths.theme.export, {}, { token: managementKey })),
  import: (theme: Theme): Promise<SdkResponse<ThemeResponse>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.theme.import, { theme }, { token: managementKey }),
    ),
});

export default WithTheme;
