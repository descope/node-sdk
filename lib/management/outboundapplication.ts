import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { OutboundApplication } from './types';

export type OutboundApplicationResponse = {
  app: OutboundApplication;
};

export type MultipleOutboundApplicationResponse = {
  apps: OutboundApplication[];
};

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const withOutboundApplication = (sdk: CoreSdk, managementKey?: string) => ({
  createApplication: (
    app: WithOptional<OutboundApplication, 'id'>,
  ): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.create,
        {
          ...app,
        },
        { token: managementKey },
      ),
      (data) => data.app,
    ),
  updateApplication: (app: OutboundApplication): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.post(
        apiPaths.outboundApplication.update,
        {
          app,
        },
        { token: managementKey },
      ),
      (data) => data.app,
    ),
  deleteApplication: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.outboundApplication.delete, { id }, { token: managementKey }),
    ),
  loadApplication: (id: string): Promise<SdkResponse<OutboundApplication>> =>
    transformResponse<OutboundApplicationResponse, OutboundApplication>(
      sdk.httpClient.get(`${apiPaths.outboundApplication.load}/${id}`, {
        token: managementKey,
      }),
      (data) => data.app,
    ),
  loadAllApplications: (): Promise<SdkResponse<OutboundApplication[]>> =>
    transformResponse<MultipleOutboundApplicationResponse, OutboundApplication[]>(
      sdk.httpClient.get(apiPaths.outboundApplication.loadAll, {
        token: managementKey,
      }),
      (data) => data.apps,
    ),
});

export default withOutboundApplication;
