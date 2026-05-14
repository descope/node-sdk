import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { License } from './types';

const withLicense = (httpClient: HttpClient) => ({
  get: (): Promise<SdkResponse<License>> =>
    transformResponse<License>(httpClient.get(apiPaths.license.get)),
});

export default withLicense;
