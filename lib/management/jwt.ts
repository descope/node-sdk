import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { UpdateJWTResponse } from './types';

const withJWT = (sdk: CoreSdk, managementKey?: string) => ({
  update: (
    jwt: string,
    customClaims?: Record<string, any>,
  ): Promise<SdkResponse<UpdateJWTResponse>> =>
    transformResponse(
      sdk.httpClient.post(apiPaths.jwt.update, { jwt, customClaims }, { token: managementKey }),
    ),
});

export default withJWT;
