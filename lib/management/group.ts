import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { Group } from './types';

const withGroup = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Load all groups for a specific tenant id.
   * @param tenantId Tenant ID to load groups from.
   * @returns Group[] list of groups
   */
  loadAllGroups: (tenantId: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      sdk.httpClient.post(apiPaths.group.loadAllGroups, { tenantId }, { token: managementKey }),
    ),

  /**
   * Load all groups for the provided user JWT subjects or identifiers.
   * @param tenantId Tenant ID to load groups from.
   * @param jwtSubjects Optional List of JWT subjects, with the format of "U2J5ES9S8TkvCgOvcrkpzUgVTEBM" (example), which can be found on the user's JWT.
   * @param identifiers Optional List of identifiers, identifier is the actual user identifier used for sign in.
   * @returns Group[] list of groups
   */
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

  /**
   * Load all members of the provided group id.
   * @param tenantId Tenant ID to load groups from.
   * @param groupId Group ID to load members for.
   * @returns Group[] list of groups
   */
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
