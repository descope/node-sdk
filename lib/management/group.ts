import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { Group } from './types';

const withGroup = (sdk: CoreSdk, managementKey?: string) => ({
  loadAllGroups: (tenantId: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      sdk.httpClient.post(apiPaths.group.loadAllGroups, { tenantId }, { token: managementKey }),
    ),
  loadAllGroupsForMember: (
    tenantId: string,
    jwtSubjects: string[],
    identifiers: string[],
  ): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      sdk.httpClient.post(
        apiPaths.group.loadAllGroupsForMember,
        { tenantId, identifiers, jwtSubjects },
        { token: managementKey },
      ),
    ),
  loadAllGroupMembers: (tenantId: string, groupId: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      sdk.httpClient.post(
        apiPaths.group.loadAllGroupMembers,
        { tenantId, groupId },
        { token: managementKey },
      ),
    ),
});

export default withGroup;
