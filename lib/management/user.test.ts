import { SdkResponse, UserResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockUserResponse = {
  name: 'foo',
};

const mockMgmtUserResponse = {
  user: mockUserResponse,
};

const mockMgmtUsersResponse = {
  users: [mockUserResponse],
};

describe('Management User', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.create(
        'loginId',
        'a@b.c',
        null,
        null,
        ['r1', 'r2'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          phone: null,
          displayName: null,
          roleNames: ['r1', 'r2'],
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('invite', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.invite(
        'loginId',
        'a@b.c',
        null,
        null,
        ['r1', 'r2'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          phone: null,
          displayName: null,
          roleNames: ['r1', 'r2'],
          invite: true,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.update('loginId', 'a@b.c');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.update,
        { loginId: 'loginId', email: 'a@b.c' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('delete', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.delete('loginId');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.delete,
        { loginId: 'loginId' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('load', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.load('loginId');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.user.load, {
        queryParams: { loginId: 'loginId' },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadByUserId', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.loadByUserId('userId');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.user.load, {
        queryParams: { userId: 'userId' },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('searchAll', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUsersResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUsersResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse[]> = await management.user.searchAll(
        ['t1'],
        ['r1'],
        100,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.search,
        { tenantIds: ['t1'], roleNames: ['r1'], limit: 100 },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: [mockUserResponse],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('activate', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.activate('lid');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateStatus,
        { loginId: 'lid', status: 'enabled' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deactivate', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.deactivate('lid');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateStatus,
        { loginId: 'lid', status: 'disabled' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateEmail', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.updateEmail(
        'lid',
        'a@b.c',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateEmail,
        { loginId: 'lid', email: 'a@b.c', verified: true },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updatePhone', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.updatePhone(
        'lid',
        '1234',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updatePhone,
        { loginId: 'lid', phone: '1234', verified: true },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateDisplayName', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.updateDisplayName('lid', 'foo');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateDisplayName,
        { loginId: 'lid', displayName: 'foo' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('addRoles', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.addRoles('lid', ['foo', 'bar']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.addRole,
        { loginId: 'lid', roleNames: ['foo', 'bar'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('removeRoles', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.removeRoles('lid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.removeRole,
        { loginId: 'lid', roleNames: ['foo', 'bar'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('addTenant', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.addTenant('lid', 'tid');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.addTenant,
        { loginId: 'lid', tenantId: 'tid' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('removeTenant', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.removeTenant('lid', 'tid');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.removeTenant,
        { loginId: 'lid', tenantId: 'tid' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('addTenantRoles', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.addTenantRoles('lid', 'tid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.addRole,
        { loginId: 'lid', tenantId: 'tid', roleNames: ['foo', 'bar'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('removeTenantRoles', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.removeTenantRoles(
        'lid',
        'tid',
        ['foo', 'bar'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.removeRole,
        { loginId: 'lid', tenantId: 'tid', roleNames: ['foo', 'bar'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockUserResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
