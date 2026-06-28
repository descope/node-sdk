import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Engine, EngineSecretResponse } from './types';

type SingleEngineResponse = {
  engine: Engine;
};

type MultipleEnginesResponse = {
  engines: Engine[];
};

const withEngine = (httpClient: HttpClient) => ({
  /**
   * Create a new engine. The returned engine includes its generated id and secret.
   * The secret is returned only here (and on rotateSecret) — store it securely.
   * @param name Engine name
   * @returns The newly created engine, including its secret
   */
  create: (name: string): Promise<SdkResponse<Engine>> =>
    transformResponse<SingleEngineResponse, Engine>(
      httpClient.post(apiPaths.engine.create, { name }),
      (data) => data.engine,
    ),
  /**
   * Update an engine's name. The returned engine does not include the secret.
   * @param id Engine id to update
   * @param name Updated engine name
   * @returns The updated engine
   */
  update: (id: string, name: string): Promise<SdkResponse<Engine>> =>
    transformResponse<SingleEngineResponse, Engine>(
      httpClient.post(apiPaths.engine.update, { id, name }),
      (data) => data.engine,
    ),
  /**
   * Delete an engine.
   * @param id Engine id to delete
   */
  delete: (id: string): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.engine.delete, { id })),
  /**
   * Load a specific engine by id. The returned engine's secret is always empty.
   * @param id Engine id to load
   * @returns The loaded engine
   */
  load: (id: string): Promise<SdkResponse<Engine>> =>
    transformResponse<SingleEngineResponse, Engine>(
      httpClient.get(apiPaths.engine.load, { queryParams: { id } }),
      (data) => data.engine,
    ),
  /**
   * Load all engines for the project. The returned engines' secrets are always empty.
   * @returns An array of all engines
   */
  loadAll: (): Promise<SdkResponse<Engine[]>> =>
    transformResponse<MultipleEnginesResponse, Engine[]>(
      httpClient.get(apiPaths.engine.loadAll, {}),
      (data) => data.engines,
    ),
  /**
   * Rotate an engine's secret, invalidating the previous one. The new secret is
   * returned in cleartext — store it securely, as it cannot be retrieved again.
   * @param id Engine id whose secret to rotate
   * @returns The new secret
   */
  rotateSecret: (id: string): Promise<SdkResponse<EngineSecretResponse>> =>
    transformResponse<EngineSecretResponse, EngineSecretResponse>(
      httpClient.post(apiPaths.engine.rotate, { id }),
      (data) => data,
    ),
});

export default withEngine;
