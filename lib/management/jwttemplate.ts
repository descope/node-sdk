import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  ApplyJWTTemplateFromLibraryRequest,
  JWTTemplate,
  JWTTemplateLibraryEntry,
  JWTTemplateValidationResult,
} from './types';

const withJWTTemplate = (httpClient: HttpClient) => ({
  create: (template: JWTTemplate): Promise<SdkResponse<JWTTemplate>> =>
    transformResponse(
      httpClient.post(apiPaths.jwtTemplate.create, { template }),
      (data) => data.template,
    ),

  update: (template: JWTTemplate): Promise<SdkResponse<JWTTemplate>> =>
    transformResponse(
      httpClient.post(apiPaths.jwtTemplate.update, { template }),
      (data) => data.template,
    ),

  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.jwtTemplate.delete, { id })),

  list: (): Promise<SdkResponse<JWTTemplate[]>> =>
    transformResponse(httpClient.post(apiPaths.jwtTemplate.list, {}), (data) => data.templates),

  load: (id: string): Promise<SdkResponse<JWTTemplate>> =>
    transformResponse(httpClient.post(apiPaths.jwtTemplate.load, { id }), (data) => data.template),

  validate: (
    id: string,
    template?: JWTTemplate,
  ): Promise<SdkResponse<JWTTemplateValidationResult>> =>
    transformResponse(httpClient.post(apiPaths.jwtTemplate.validate, { id, template })),

  listLibrary: (): Promise<SdkResponse<JWTTemplateLibraryEntry[]>> =>
    transformResponse(
      httpClient.post(apiPaths.jwtTemplate.libraryList, {}),
      (data) => data.entries,
    ),

  loadLibraryEntry: (id: string): Promise<SdkResponse<JWTTemplateLibraryEntry>> =>
    transformResponse(
      httpClient.post(apiPaths.jwtTemplate.libraryLoad, { id }),
      (data) => data.entry,
    ),

  applyFromLibrary: (
    request: ApplyJWTTemplateFromLibraryRequest,
  ): Promise<SdkResponse<JWTTemplate>> =>
    transformResponse(
      httpClient.post(apiPaths.jwtTemplate.libraryApply, request),
      (data) => data.template,
    ),
});

export default withJWTTemplate;
