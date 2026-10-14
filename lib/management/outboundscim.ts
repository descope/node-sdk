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

const withOutboundSCIM = (httpClient: HttpClient) => ({
  /** Create a new outbound SCIM configuration on the federated SSO application identified by `appId`. */
  createConfiguration: (
    request: CreateOutboundSCIMConfigurationRequest,
  ): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.create, { ...request }),
      (data) => data.configuration,
    ),
  /**
   * Update the outbound SCIM configuration attached to the given federated SSO app. `version`
   * must match the currently stored version — a mismatch fails the update (optimistic concurrency).
   */
  updateConfiguration: (
    request: UpdateOutboundSCIMConfigurationRequest,
  ): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.update, { ...request }),
      (data) => data.configuration,
    ),
  /** Delete the outbound SCIM configuration attached to the given federated SSO app. */
  deleteConfiguration: (appId: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.outboundSCIM.delete, { appId })),
  /** Load the outbound SCIM configuration attached to the given federated SSO app. */
  loadConfiguration: (appId: string): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.get(`${apiPaths.outboundSCIM.load}/${appId}`),
      (data) => data.configuration,
    ),
  /** Enable or disable the outbound SCIM configuration attached to the given federated SSO app. */
  setEnabled: (appId: string, enabled: boolean): Promise<SdkResponse<OutboundSCIMConfiguration>> =>
    transformResponse<OutboundSCIMConfigurationResponse, OutboundSCIMConfiguration>(
      httpClient.post(apiPaths.outboundSCIM.setEnabled, { appId, enabled }),
      (data) => data.configuration,
    ),
});

export default withOutboundSCIM;
