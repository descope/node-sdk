import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  InboundApplication,
  InboundApplicationConsent,
  InboundApplicationConsentCreateOptions,
  InboundApplicationConsentDeleteOptions,
  InboundApplicationTenantConsentDeleteOptions,
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

type InboundApplicationConsentResponse = {
  consent: InboundApplicationConsent;
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
  deleteApplicationBatch: (ids: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplication.deleteBatch, { ids })),
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
  /**
   * Create a user consent for an inbound application, e.g. to migrate consents a user
   * already granted in another system so the user is not asked to consent again.
   * The scopes are merged into the user's existing consent for the same application and tenant.
   * Consents of agentic applications cannot be created.
   * @param options the consent to create
   * @returns the created or updated consent
   */
  createConsent: (
    options: InboundApplicationConsentCreateOptions,
  ): Promise<SdkResponse<InboundApplicationConsent>> =>
    transformResponse<InboundApplicationConsentResponse, InboundApplicationConsent>(
      httpClient.post(apiPaths.inboundApplicationConsents.create, { ...options }),
      (data) => data.consent,
    ),
  searchConsents: (
    options?: InboundApplicationConsentSearchOptions,
  ): Promise<SdkResponse<InboundApplicationConsent[]>> =>
    transformResponse<MultipleInboundApplicationConsentsResponse, InboundApplicationConsent[]>(
      httpClient.post(apiPaths.inboundApplicationConsents.search, { ...options }),
      (data) => data.consents,
    ),
  deleteConsents: (options: InboundApplicationConsentDeleteOptions): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.inboundApplicationConsents.delete, { ...options })),
  deleteTenantConsents: (
    options: InboundApplicationTenantConsentDeleteOptions,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.inboundApplicationConsents.deleteTenant, { ...options }),
    ),
});

export default withInboundApplication;
