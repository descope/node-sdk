import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { ScopeClaimMappingEntry } from './types';

const withScopeClaimMapping = (httpClient: HttpClient) => ({
  get: (): Promise<SdkResponse<ScopeClaimMappingEntry[]>> =>
    transformResponse(httpClient.post(apiPaths.scopeClaimMapping.get, {}), (data) => data.mappings),

  set: (mappings: ScopeClaimMappingEntry[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.scopeClaimMapping.set, { mappings })),

  delete: (): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.scopeClaimMapping.delete, {})),
});

export default withScopeClaimMapping;
