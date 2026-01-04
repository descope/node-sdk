import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
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

const withInboundApplication = (httpClient: HttpClient) => ({
  createApplication: (
    options: InboundApplicationOptions,
  ): Promise<SdkResponse<CreateInboundApplicationResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.inboundApplication.create, {
        ...options,
      }),
    ),
  updateApplication: (
    options: InboundApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplication.update, { ...options })),
  patchApplication: (
    options: Partial<InboundApplicationOptions> & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplication.patch, { ...options })),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplication.delete, { id })),
  loadApplication: (id: string): Promise<SdkResponse<InboundApplication>> =>
    transformResponse<InboundApplication, InboundApplication>(
      httpClient.get(apiPaths.inboundApplication.load, {
        queryParams: { id },
      }),
      (data) => data,
    ),
  loadAllApplications: (): Promise<SdkResponse<InboundApplication[]>> =>
    transformResponse<MultipleInboundApplicationResponse, InboundApplication[]>(
      httpClient.get(apiPaths.inboundApplication.loadAll, {}),
      (data) => data.apps,
    ),
  getApplicationSecret: (id: string): Promise<SdkResponse<InboundApplicationSecretResponse>> =>
    transformResponse<InboundApplicationSecretResponse, InboundApplicationSecretResponse>(
      httpClient.get(apiPaths.inboundApplication.secret, {
        queryParams: { id },
      }),
      (data) => data,
    ),
  rotateApplicationSecret: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplication.rotate, { id })),
  searchConsents: (
    options?: InboundApplicationConsentSearchOptions,
  ): Promise<SdkResponse<InboundApplicationConsent[]>> =>
    transformResponse<MultipleInboundApplicationConsentsResponse, InboundApplicationConsent[]>(
      httpClient.post(apiPaths.inboundApplicationConsents.search, { ...options }),
      (data) => data.consents,
    ),
  deleteConsents: (options: InboundApplicationConsentDeleteOptions): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplicationConsents.delete, { ...options })),
});

export default withInboundApplication;
