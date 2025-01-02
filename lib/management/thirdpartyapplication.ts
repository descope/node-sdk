import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import {
  ThirdPartyApplication,
  ThirdPartyApplicationConsent,
  ThirdPartyApplicationConsentDeleteOptions,
  ThirdPartyApplicationConsentSearchOptions,
  CreateThirdPartyApplicationResponse,
  ThirdPartyApplicationOptions,
} from './types';

type MultipleThirdPartyApplicationResponse = {
  apps: ThirdPartyApplication[];
};

type MultipleThirdPartyApplicationConsentsResponse = {
  consents: ThirdPartyApplicationConsent[];
};

const withThirdPartyApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createApplication: (
    options: ThirdPartyApplicationOptions,
  ): Promise<SdkResponse<CreateThirdPartyApplicationResponse>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.thirdPartyApplication.create,
        {
          ...options,
        },
        { token: managementKey },
      ),
    ),
  updateApplication: (
    options: ThirdPartyApplicationOptions & { id: string },
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.thirdPartyApplication.update,
        { ...options },
        { token: managementKey },
      ),
    ),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.thirdPartyApplication.delete, { id }, { token: managementKey }),
    ),
  loadApplication: (id: string): Promise<SdkResponse<ThirdPartyApplication>> =>
    transformResponse<ThirdPartyApplication, ThirdPartyApplication>(
      sdk.httpClient.get(apiPaths.thirdPartyApplication.load, {
        queryParams: { id },
        token: managementKey,
      }),
      (data) => data,
    ),
  loadAllApplications: (): Promise<SdkResponse<ThirdPartyApplication[]>> =>
    transformResponse<MultipleThirdPartyApplicationResponse, ThirdPartyApplication[]>(
      sdk.httpClient.get(apiPaths.thirdPartyApplication.loadAll, {
        token: managementKey,
      }),
      (data) => data.apps,
    ),
  searchConsents: (
    options?: ThirdPartyApplicationConsentSearchOptions,
  ): Promise<SdkResponse<ThirdPartyApplicationConsent[]>> =>
    transformResponse<
      MultipleThirdPartyApplicationConsentsResponse,
      ThirdPartyApplicationConsent[]
    >(
      sdk.httpClient.post(
        apiPaths.thirdPartyApplicationConsents.search,
        { ...options },
        { token: managementKey },
      ),
      (data) => data.consents,
    ),
  deleteConsents: (
    options: ThirdPartyApplicationConsentDeleteOptions,
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(
        apiPaths.thirdPartyApplicationConsents.delete,
        { ...options },
        { token: managementKey },
      ),
    ),
});

export default withThirdPartyApplication;
