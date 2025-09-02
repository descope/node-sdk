import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Theme, ThemeResponse } from './types';

const WithTheme = (httpClient: HttpClient) => ({
  export: (): Promise<SdkResponse<ThemeResponse>> =>
    transformResponse(httpClient.post(apiPaths.theme.export, {})),
  import: (theme: Theme): Promise<SdkResponse<ThemeResponse>> =>
    transformResponse(httpClient.post(apiPaths.theme.import, { theme })),
});

export default WithTheme;
