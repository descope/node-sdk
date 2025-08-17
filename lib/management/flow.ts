import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  FlowResponse,
  FlowsResponse,
  Screen,
  Flow,
  ManagementFlowOptions,
  RunManagementFlowResponse,
} from './types';

const WithFlow = (httpClient: HttpClient) => ({
  list: (): Promise<SdkResponse<FlowsResponse>> =>
    transformResponse(httpClient.post(apiPaths.flow.list, {})),
  delete: (flowIds: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.flow.delete, { ids: flowIds })),
  export: (flowId: string): Promise<SdkResponse<FlowResponse>> =>
    transformResponse(httpClient.post(apiPaths.flow.export, { flowId })),
  import: (flowId: string, flow: Flow, screens?: Screen[]): Promise<SdkResponse<FlowResponse>> =>
    transformResponse(httpClient.post(apiPaths.flow.import, { flowId, flow, screens })),
  run: (
    flowId: string,
    options?: ManagementFlowOptions,
  ): Promise<SdkResponse<RunManagementFlowResponse['output']>> =>
    transformResponse(
      httpClient.post(apiPaths.flow.run, { flowId, options }),
      (data) => (data as RunManagementFlowResponse)?.output,
    ),
});

export default WithFlow;
