import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { List, ListRequest } from './types';

const withList = (httpClient: HttpClient) => ({
  create: (request: ListRequest): Promise<SdkResponse<List>> =>
    transformResponse(httpClient.post(apiPaths.list.create, request), (data) => data.list),

  update: (id: string, request: ListRequest): Promise<SdkResponse<List>> =>
    transformResponse(
      httpClient.post(apiPaths.list.update, { id, ...request }),
      (data) => data.list,
    ),

  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.delete, { id })),

  load: (id: string): Promise<SdkResponse<List>> =>
    transformResponse(
      httpClient.get(`${apiPaths.list.load}/${encodeURIComponent(id)}`),
      (data) => data.list,
    ),

  loadByName: (name: string): Promise<SdkResponse<List>> =>
    transformResponse(
      httpClient.get(`${apiPaths.list.loadByName}/${encodeURIComponent(name)}`),
      (data) => data.list,
    ),

  loadAll: (): Promise<SdkResponse<List[]>> =>
    transformResponse(httpClient.get(apiPaths.list.loadAll), (data) => data.lists),

  import: (lists: List[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.import, { lists })),

  addIPs: (id: string, ips: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.addIPs, { id, ips })),

  removeIPs: (id: string, ips: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.removeIPs, { id, ips })),

  checkIP: (id: string, ip: string): Promise<SdkResponse<boolean>> =>
    transformResponse(httpClient.post(apiPaths.list.checkIP, { id, ip }), (data) => data.exists),

  addTexts: (id: string, texts: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.addTexts, { id, texts })),

  removeTexts: (id: string, texts: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.removeTexts, { id, texts })),

  checkText: (id: string, text: string): Promise<SdkResponse<boolean>> =>
    transformResponse(
      httpClient.post(apiPaths.list.checkText, { id, text }),
      (data) => data.exists,
    ),

  clear: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.list.clear, { id })),
});

export default withList;
