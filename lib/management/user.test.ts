import { SdkResponse, UserResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import {
  GenerateOTPForTestResponse,
  GenerateMagicLinkForTestResponse,
  GenerateEnchantedLinkForTestResponse,
  ProviderTokenResponse,
  UserStatus,
} from './types';

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
        null,
        { a: 'a', b: 1, c: true },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          phone: null,
          displayName: null,
          roleNames: ['r1', 'r2'],
          userTenants: null,
          customAttributes: { a: 'a', b: 1, c: true },
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

  describe('createTestUser', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.createTestUser(
        'loginId',
        'a@b.c',
        null,
        null,
        ['r1', 'r2'],
        null,
        { a: 'a', b: 1, c: true },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          phone: null,
          displayName: null,
          roleNames: ['r1', 'r2'],
          test: true,
          userTenants: null,
          customAttributes: { a: 'a', b: 1, c: true },
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
        null,
        { a: 'a', b: 1, c: true },
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
          userTenants: null,
          customAttributes: { a: 'a', b: 1, c: true },
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

  describe('deleteAllTestUsers', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.user.deleteAllTestUsers();

      expect(mockHttpClient.delete).toHaveBeenCalledWith(apiPaths.user.deleteAllTestUsers, {
        token: 'key',
      });

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
        undefined,
        undefined,
        undefined,
        undefined,
        [UserStatus.enabled],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.search,
        { tenantIds: ['t1'], roleNames: ['r1'], limit: 100, statuses: [UserStatus.enabled] },
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

  describe('getProviderToken', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockProviderTokenResponse = { provider: 'p1' };
      const httpResponse = {
        ok: true,
        json: () => mockProviderTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockProviderTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ProviderTokenResponse> = await management.user.getProviderToken(
        'loginId',
        'p1',
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.user.getProviderToken, {
        queryParams: { loginId: 'loginId', provider: 'p1' },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockProviderTokenResponse,
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

  describe('updateLoginId', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.updateLoginId('lid', 'a@b.c');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateLoginId,
        { loginId: 'lid', newLoginId: 'a@b.c' },
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

  describe('updatePicture', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.updatePicture('lid', 'foo');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updatePicture,
        { loginId: 'lid', picture: 'foo' },
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

  describe('updateCustomAttribute', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.updateCustomAttribute(
        'lid',
        'foo',
        'bar',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.updateCustomAttribute,
        { loginId: 'lid', attributeKey: 'foo', attributeValue: 'bar' },
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

  describe('generateOTPForTestUser', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = { loginId: 'some-id', code: '123456' };
      const httpResponse = {
        ok: true,
        json: () => mockResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<GenerateOTPForTestResponse> =
        await management.user.generateOTPForTestUser('sms', 'some-id');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateOTPForTest,
        { loginId: 'some-id', deliveryMethod: 'sms' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('generateMagicLinkForTestUser', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = { loginId: 'some-id', link: 'some-link' };
      const httpResponse = {
        ok: true,
        json: () => mockResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<GenerateMagicLinkForTestResponse> =
        await management.user.generateMagicLinkForTestUser('email', 'some-id', 'some-uri');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateMagicLinkForTest,
        { loginId: 'some-id', deliveryMethod: 'email', URI: 'some-uri' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('generateEnchantedLinkForTestUser', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = {
        loginId: 'some-id',
        link: 'some-link',
        pendingRef: 'some-pending-ref',
      };
      const httpResponse = {
        ok: true,
        json: () => mockResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<GenerateEnchantedLinkForTestResponse> =
        await management.user.generateEnchantedLinkForTestUser('some-id', 'some-uri');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateEnchantedLinkForTest,
        { loginId: 'some-id', URI: 'some-uri' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('setPassword', () => {
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

      const loginId = 'some-id';
      const password = 'some-password';
      const resp = await management.user.setPassword(loginId, password);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.setPassword,
        { loginId, password },
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

  describe('expirePassword', () => {
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

      const loginId = 'some-id';
      const resp = await management.user.expirePassword(loginId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.expirePassword,
        { loginId },
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
});
