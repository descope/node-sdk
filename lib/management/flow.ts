import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { FlowResponse, FlowsResponse, Screen, Flow } from './types';

const WithFlow = (sdk: CoreSdk, managementKey?: string) => ({
  list: (): Promise<SdkResponse<FlowsResponse>> =>
    transformResponse(sdk.httpClient.post(apiPaths.flow.list, {}, { token: managementKey })),
  delete: (flowIds: string[]): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.flow.delete, { ids: flowIds }, { token: managementKey }),
    ),
  export: (flowId: string): Promise<SdkResponse<FlowResponse>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.flow.export, { flowId }, { token: managementKey }),
    ),
  import: (flowId: string, flow: Flow, screens?: Screen[]): Promise<SdkResponse<FlowResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.flow.import,
        { flowId, flow, screens },
        { token: managementKey },
      ),
    ),
});

export default WithFlow;
