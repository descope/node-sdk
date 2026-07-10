import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  OutboundSCIMConfiguration,
  CreateOutboundSCIMConfigurationRequest,
  UpdateOutboundSCIMConfigurationRequest,
} from './types';

type OutboundSCIMConfigurationResponse = {
  configuration: OutboundSCIMConfiguration;
};

type MultipleOutboundSCIMConfigurationsResponse = {
  configurations: OutboundSCIMConfiguration[];
};

const withOutboundSCIM = (httpClient: HttpClient) => ({
  /** Create a new outbound SCIM configuration bound to an outbound application. */
  createConfiguration: (
    request: CreateOutboundSCIMConfigurationRequest,
  ): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.create, { ...request }),
      (data) => data.configuration,
    ),
  /**
   * Update an existing outbound SCIM configuration. `version` must match the currently
   * stored version — a mismatch fails the update (optimistic concurrency).
   */
  updateConfiguration: (
    request: UpdateOutboundSCIMConfigurationRequest,
  ): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.update, { ...request }),
      (data) => data.configuration,
    ),
  /** Delete an outbound SCIM configuration by id. */
  deleteConfiguration: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.outboundSCIM.delete, { id })),
  /** Load a single outbound SCIM configuration by id. */
  loadConfiguration: (id: string): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.get(`${apiPaths.outboundSCIM.load}/${id}`),
      (data) => data.configuration,
    ),
  /** Load all outbound SCIM configurations for the project. */
  loadAllConfigurations: (): Promise<SdkResponse<OutboundSCIMConfiguration[]>> =>
    transformResponse<MultipleOutboundSCIMConfigurationsResponse, OutboundSCIMConfiguration[]>(
      httpClient.get(apiPaths.outboundSCIM.loadAll, {}),
      (data) => data.configurations,
    ),
  /** Enable or disable an outbound SCIM configuration. */
  setEnabled: (id: string, enabled: boolean): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.setEnabled, { id, enabled }),
      (data) => data.configuration,
    ),
});

export default withOutboundSCIM;
