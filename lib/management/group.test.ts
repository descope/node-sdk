import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { Group } from './types';

const management = withManagement(mockCoreSdk, 'key');

const mockGroups = [
  { id: 'id1', display: 'display1', members: [] },
  { name: 'id2', display: 'display2', members: [] },
  { name: 'id3', display: 'display3', members: [] },
];

describe('Management group', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.group.loadAllGroups,
        { tenantId },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockGroups,
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.group.loadAllGroupsForMember,
        { tenantId, userIds, loginIds },
        { token: 'key' },
      );

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.group.loadAllGroupMembers,
        { tenantId, groupId },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockGroups,
      });
    });
  });
});
