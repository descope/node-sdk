import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  InboundApplication,
  InboundApplicationConsent,
  InboundApplicationConsentDeleteOptions,
  InboundApplicationConsentSearchOptions,
  CreateInboundApplicationResponse,
  InboundApplicationOptions,
  InboundApplicationSecretResponse,
} from './types';

type MultipleInboundApplicationResponse = {
  apps: InboundApplication[];
};

type MultipleInboundApplicationConsentsResponse = {
  consents: InboundApplicationConsent[];
};

const withInboundApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createApplication: (
    options: InboundApplicationOptions,
  ): Promise<SdkResponse<CreateInboundApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.inboundApplication.create,
        {
          ...options,
        },
        { token: managementKey },
      ),
    ),
  updateApplication: (
    options: InboundApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.inboundApplication.update,
        { ...options },
        { token: managementKey },
      ),
    ),
  patchApplication: (
    options: Partial<InboundApplicationOptions> & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.inboundApplication.patch,
        { ...options },
        { token: managementKey },
      ),
    ),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.inboundApplication.delete, { id }, { token: managementKey }),
    ),
  loadApplication: (id: string): Promise<SdkResponse<InboundApplication>> =>
    transformResponse<InboundApplication, InboundApplication>(
      sdk.httpClient.get(apiPaths.inboundApplication.load, {
        queryParams: { id },
        token: managementKey,
      }),
      (data) => data,
    ),
  loadAllApplications: (): Promise<SdkResponse<InboundApplication[]>> =>
    transformResponse<MultipleInboundApplicationResponse, InboundApplication[]>(
      sdk.httpClient.get(apiPaths.inboundApplication.loadAll, {
        token: managementKey,
      }),
      (data) => data.apps,
    ),
  getApplicationSecret: (id: string): Promise<SdkResponse<InboundApplicationSecretResponse>> =>
    transformResponse<InboundApplicationSecretResponse, InboundApplicationSecretResponse>(
      sdk.httpClient.get(apiPaths.inboundApplication.secret, {
        queryParams: { id },
        token: managementKey,
      }),
      (data) => data,
    ),
  rotateApplicationSecret: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.inboundApplication.rotate, { id }, { token: managementKey }),
    ),
  searchConsents: (
    options?: InboundApplicationConsentSearchOptions,
  ): Promise<SdkResponse<InboundApplicationConsent[]>> =>
    transformResponse<MultipleInboundApplicationConsentsResponse, InboundApplicationConsent[]>(
      sdk.httpClient.post(
        apiPaths.inboundApplicationConsents.search,
        { ...options },
        { token: managementKey },
      ),
      (data) => data.consents,
    ),
  deleteConsents: (options: InboundApplicationConsentDeleteOptions): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.inboundApplicationConsents.delete,
        { ...options },
        { token: managementKey },
      ),
    ),
});

export default withInboundApplication;
