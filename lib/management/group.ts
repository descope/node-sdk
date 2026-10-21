import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { Group } from './types';

const withGroup = (httpClient: HttpClient) => ({
  /**
   * Load all groups for a specific tenant id.
   * @param tenantId Tenant ID to load groups from.
   * @param ssoId Optional SSO configuration id to load only groups that came from that SSO
   * configuration (the ssoId used at SCIM provisioning or JIT login). Use the reserved id
   * "default_ssoid" for the tenant's default SSO configuration.
   * @returns Group[] list of groups
   */
  loadAllGroups: (tenantId: string, ssoId?: string): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(httpClient.post(apiPaths.group.loadAllGroups, { tenantId, ssoId })),

  /**
   * Load all groups for the provided user IDs or login IDs.
   * @param tenantId Tenant ID to load groups from.
   * @param userIds Optional List of user IDs, with the format of "U2J5ES9S8TkvCgOvcrkpzUgVTEBM" (example), which can be found on the user's JWT.
   * @param loginIds Optional List of login IDs, how the user identifies when logging in.
   * @param ssoId Optional SSO configuration id to load only groups that came from that SSO
   * configuration. Use the reserved id "default_ssoid" for the tenant's default SSO configuration.
   * @returns Group[] list of groups
   */
  loadAllGroupsForMember: (
    tenantId: string,
    userIds: string[],
    loginIds: string[],
    ssoId?: string,
  ): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      httpClient.post(apiPaths.group.loadAllGroupsForMember, {
        tenantId,
        loginIds,
        userIds,
        ssoId,
      }),
    ),

  /**
   * Load all members of the provided group id.
   * @param tenantId Tenant ID to load groups from.
   * @param groupId Group ID to load members for.
   * @param ssoId Optional SSO configuration id: return the group only if it came from that SSO
   * configuration. Use the reserved id "default_ssoid" for the tenant's default SSO configuration.
   * @returns Group[] list of groups
   */
  loadAllGroupMembers: (
    tenantId: string,
    groupId: string,
    ssoId?: string,
  ): Promise<SdkResponse<Group[]>> =>
    transformResponse<Group[]>(
      httpClient.post(apiPaths.group.loadAllGroupMembers, { tenantId, groupId, ssoId }),
    ),
});

export default withGroup;
