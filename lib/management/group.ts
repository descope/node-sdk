import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Group } from './types';

const withGroup = (httpClient: HttpClient) => ({
  /**
   * Load all groups for a specific tenant id.
   * @param tenantId Tenant ID to load groups from.
   * @returns Group[] list of groups
   */
  loadAllGroups: (tenantId: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(httpClient.post(apiPaths.group.loadAllGroups, { tenantId })),

  /**
   * Load all groups for the provided user IDs or login IDs.
   * @param tenantId Tenant ID to load groups from.
   * @param userIds Optional List of user IDs, with the format of "U2J5ES9S8TkvCgOvcrkpzUgVTEBM" (example), which can be found on the user's JWT.
   * @param loginIds Optional List of login IDs, how the user identifies when logging in.
   * @returns Group[] list of groups
   */
  loadAllGroupsForMember: (
    tenantId: string,
    userIds: string[],
    loginIds: string[],
  ): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      httpClient.post(apiPaths.group.loadAllGroupsForMember, { tenantId, loginIds, userIds }),
    ),

  /**
   * Load all members of the provided group id.
   * @param tenantId Tenant ID to load groups from.
   * @param groupId Group ID to load members for.
   * @returns Group[] list of groups
   */
  loadAllGroupMembers: (tenantId: string, groupId: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      httpClient.post(apiPaths.group.loadAllGroupMembers, { tenantId, groupId }),
    ),
});

export default withGroup;
