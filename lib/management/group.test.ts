import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { Group, GroupMember } from './types';

const management = withManagement(mockHttpClient);

// Typed so the round-trip of the new `source` field is actually checked; the whole fixture cannot be
// Group[] because the other entries use a pre-existing `name` key.
const mockMembers: GroupMember[] = [
  { loginId: 'login1', userId: 'user1', display: 'member1', source: 'jit' },
  { loginId: 'login2', userId: 'user2', display: 'member2', source: 'scim' },
];

const mockGroups = [
  { id: 'id1', display: 'display1', members: mockMembers },
  { name: 'id2', display: 'display2', members: [] },
  { name: 'id3', display: 'display3', members: [] },
];

describe('Management group', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('loadAllGroups', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockGroups,
        clone: () => ({
          json: () => Promise.resolve(mockGroups),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 'tenant-id';
      const resp: SdkResponse<Group[]> = await management.group.loadAllGroups(tenantId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.group.loadAllGroups, { tenantId });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockGroups,
      });
    });

    it('should send the ssoId filter when provided', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockGroups,
        clone: () => ({
          json: () => Promise.resolve(mockGroups),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 'tenant-id';
      const ssoId = 'sso-config-1';
      await management.group.loadAllGroups(tenantId, ssoId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.group.loadAllGroups, {
        tenantId,
        ssoId,
      });
    });
  });

  describe('loadAllGroupsForMember', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockGroups,
        clone: () => ({
          json: () => Promise.resolve(mockGroups),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 'tenant-id';
      const loginIds = ['one'];
      const userIds = ['two'];
      const resp: SdkResponse<Group[]> = await management.group.loadAllGroupsForMember(
        tenantId,
        userIds,
        loginIds,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.group.loadAllGroupsForMember, {
        tenantId,
        userIds,
        loginIds,
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockGroups,
      });
    });
  });

  describe('loadAllGroupMembers', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockGroups,
        clone: () => ({
          json: () => Promise.resolve(mockGroups),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 'tenant-id';
      const groupId = 'group-id';
      const resp: SdkResponse<Group[]> = await management.group.loadAllGroupMembers(
        tenantId,
        groupId,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.group.loadAllGroupMembers, {
        tenantId,
        groupId,
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockGroups,
      });
    });
  });
});
