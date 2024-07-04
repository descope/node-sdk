import { LoginOptions, SdkResponse, UserResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import {
  GenerateOTPForTestResponse,
  GenerateMagicLinkForTestResponse,
  GenerateEnchantedLinkForTestResponse,
  ProviderTokenResponse,
  GenerateEmbeddedLinkResponse,
  InviteBatchResponse,
  UserPasswordHashed,
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

const mockMgmtInviteBatchResponse = {
  createdUsers: [{ loginId: 'one', email: 'one@one' }],
  failedUsers: [
    {
      failure: 'some failure',
      user: { loginId: 'two', email: 'two@two' },
    },
  ],
};

describe('Management User', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response with multiple arguments', async () => {
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
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        ['id-1', 'id-2'],
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
          additionalLoginIds: ['id-1', 'id-2'],
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

    it('should create user with verified attributes', async () => {
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
        undefined,
        true,
        false,
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
          verifiedEmail: true,
          verifiedPhone: false,
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

    it('should send the correct request and receive correct response with options argument', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.create('loginId', {
        email: 'a@b.c',
        roles: ['r1', 'r2'],
        customAttributes: { a: 'a', b: 1, c: true },
        additionalLoginIds: ['id-1', 'id-2'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          roleNames: ['r1', 'r2'],
          customAttributes: { a: 'a', b: 1, c: true },
          additionalLoginIds: ['id-1', 'id-2'],
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
    it('should send the correct request and receive correct response with multiple arguments', async () => {
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

    it('should send the correct request and receive correct response with options argument', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.createTestUser('loginId', {
        email: 'a@b.c',
        roles: ['r1', 'r2'],
        customAttributes: { a: 'a', b: 1, c: true },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          roleNames: ['r1', 'r2'],
          test: true,
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
    it('should send the correct request and receive correct response with multiple arguments', async () => {
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
        undefined,
        false,
        false,
        'https://invite.me',
        true,
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
          verifiedEmail: false,
          verifiedPhone: false,
          inviteUrl: 'https://invite.me',
          sendMail: true,
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

    it('should send the correct request and receive correct response with options argument', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.invite('loginId', {
        email: 'a@b.c',
        roles: ['r1', 'r2'],
        customAttributes: { a: 'a', b: 1, c: true },
        inviteUrl: 'https://invite.me',
        sendMail: true,
        templateOptions: { k1: 'v1' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          roleNames: ['r1', 'r2'],
          invite: true,
          customAttributes: { a: 'a', b: 1, c: true },
          inviteUrl: 'https://invite.me',
          sendMail: true,
          templateOptions: { k1: 'v1' },
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

  describe('invite batch', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtInviteBatchResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtInviteBatchResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const hashed: UserPasswordHashed = {
        firebase: {
          hash: 'h',
          salt: 's',
          saltSeparator: 'ss',
          signerKey: 'sk',
          memory: 14,
          rounds: 8,
        },
      };

      const resp: SdkResponse<InviteBatchResponse> = await management.user.inviteBatch(
        [
          { loginId: 'one', email: 'one@one', password: 'clear', seed: 'aaa' },
          { loginId: 'two', email: 'two@two', hashedPassword: hashed },
        ],
        'https://invite.me',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.createBatch,
        {
          users: [
            {
              loginId: 'one',
              email: 'one@one',
              password: 'clear',
              seed: 'aaa',
            },
            {
              loginId: 'two',
              email: 'two@two',
              hashedPassword: {
                firebase: {
                  hash: 'h',
                  salt: 's',
                  saltSeparator: 'ss',
                  signerKey: 'sk',
                  memory: 14,
                  rounds: 8,
                },
              },
            },
          ],
          invite: true,
          inviteUrl: 'https://invite.me',
          sendMail: true,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockMgmtInviteBatchResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response with multiple arguments', async () => {
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

    it('should send the correct request and receive correct response with option argument', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.update('loginId', {
        email: 'a@b.c',
      });

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

  describe('patch', () => {
    it('should send the request only with the set options', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtUserResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtUserResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      let resp: SdkResponse<UserResponse> = await management.user.patch('loginId', {
        email: 'a@b.c',
        phone: '+11111111',
        displayName: undefined,
        givenName: 'name1',
        middleName: 'name2',
        familyName: 'name3',
        roles: ['r1', 'r2'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.patch,
        {
          loginId: 'loginId',
          email: 'a@b.c',
          phone: '+11111111',
          givenName: 'name1',
          middleName: 'name2',
          familyName: 'name3',
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

      resp = await management.user.patch('loginId', {
        displayName: 'name',
        roles: undefined,
        email: undefined,
        userTenants: [{ tenantId: 't1', roleNames: ['r1'] }],
        customAttributes: { a: 'a', b: 1, c: true },
        picture: 'pic',
        verifiedEmail: true,
        verifiedPhone: false,
        ssoAppIds: ['sso1', 'sso2'],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.patch,
        {
          loginId: 'loginId',
          displayName: 'name',
          userTenants: [{ tenantId: 't1', roleNames: ['r1'] }],
          customAttributes: { a: 'a', b: 1, c: true },
          picture: 'pic',
          verifiedEmail: true,
          verifiedPhone: false,
          ssoAppIds: ['sso1', 'sso2'],
        },
        { token: 'key' },
      );
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

  describe('deleteByUserId', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.deleteByUserId('userId');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.delete,
        { userId: 'userId' },
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

  describe('logout', () => {
    it('should send the correct request and receive correct response for logout by login ID', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.logoutUser('loginId');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.logout,
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

    it('should send the correct request and receive correct response for logout by user ID', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<UserResponse> = await management.user.logoutUserByUserId('userId');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.logout,
        { userId: 'userId' },
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
        ['enabled'],
        ['a@b.com'],
        ['+11111111'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.search,
        {
          tenantIds: ['t1'],
          roleNames: ['r1'],
          limit: 100,
          statuses: ['enabled'],
          emails: ['a@b.com'],
          phones: ['+11111111'],
        },
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

  describe('search', () => {
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

      const resp: SdkResponse<UserResponse[]> = await management.user.search({
        tenantIds: ['t1'],
        roles: ['r1'],
        limit: 100,
        statuses: ['enabled'],
        emails: ['a@b.com'],
        phones: ['+11111111'],
        text: 'some text',
        sort: [{ field: 'aa', desc: true }, { field: 'bb' }],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.search,
        {
          tenantIds: ['t1'],
          roleNames: ['r1'],
          limit: 100,
          statuses: ['enabled'],
          emails: ['a@b.com'],
          phones: ['+11111111'],
          text: 'some text',
          sort: [{ field: 'aa', desc: true }, { field: 'bb' }],
        },
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

  describe('setRoles', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.setRoles('lid', ['foo', 'bar']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.setRole,
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

  describe('setSSOApps', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.setSSOapps('lid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.setSSOApps,
        { loginId: 'lid', ssoAppIds: ['foo', 'bar'] },
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

  describe('addSSOApps', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.addSSOapps('lid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.addSSOApps,
        { loginId: 'lid', ssoAppIds: ['foo', 'bar'] },
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

  describe('removeSSOApps', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.removeSSOapps('lid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.removeSSOApps,
        { loginId: 'lid', ssoAppIds: ['foo', 'bar'] },
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

  describe('setTenantRoles', () => {
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

      const resp: SdkResponse<UserResponse> = await management.user.setTenantRoles('lid', 'tid', [
        'foo',
        'bar',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.setRole,
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

      const loginOptions: LoginOptions = {
        stepup: true,
      };
      const resp: SdkResponse<GenerateOTPForTestResponse> =
        await management.user.generateOTPForTestUser('sms', 'some-id', loginOptions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateOTPForTest,
        { loginId: 'some-id', deliveryMethod: 'sms', loginOptions },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockResponse,
        ok: true,
        response: httpResponse,
      });
    });

    it('should send the correct request and receive correct response for voice', async () => {
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

      const loginOptions: LoginOptions = {
        stepup: true,
      };
      const resp: SdkResponse<GenerateOTPForTestResponse> =
        await management.user.generateOTPForTestUser('voice', 'some-id', loginOptions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateOTPForTest,
        { loginId: 'some-id', deliveryMethod: 'voice', loginOptions },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockResponse,
        ok: true,
        response: httpResponse,
      });
    });

    it('should send the correct request and receive correct response when passing embedded delivery method', async () => {
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

      const loginOptions: LoginOptions = {
        stepup: true,
      };
      const resp: SdkResponse<GenerateOTPForTestResponse> =
        await management.user.generateOTPForTestUser('Embedded', 'some-id', loginOptions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateOTPForTest,
        { loginId: 'some-id', deliveryMethod: 'Embedded', loginOptions },
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

      const loginOptions: LoginOptions = {
        stepup: true,
      };
      const resp: SdkResponse<GenerateMagicLinkForTestResponse> =
        await management.user.generateMagicLinkForTestUser(
          'email',
          'some-id',
          'some-uri',
          loginOptions,
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateMagicLinkForTest,
        { loginId: 'some-id', deliveryMethod: 'email', URI: 'some-uri', loginOptions },
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

      const loginOptions: LoginOptions = {
        stepup: true,
      };
      const resp: SdkResponse<GenerateEnchantedLinkForTestResponse> =
        await management.user.generateEnchantedLinkForTestUser('some-id', 'some-uri', loginOptions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateEnchantedLinkForTest,
        { loginId: 'some-id', URI: 'some-uri', loginOptions },
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

  describe('generateEmbeddedLink', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = {
        token: 'myToken',
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

      const resp: SdkResponse<GenerateEmbeddedLinkResponse> =
        await management.user.generateEmbeddedLink('some-id', { k1: 'v1' });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.generateEmbeddedLink,
        { loginId: 'some-id', customClaims: { k1: 'v1' } },
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

  it('should send the correct request and receive correct response - set temporary password', async () => {
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
    const resp = await management.user.setTemporaryPassword(loginId, password);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      apiPaths.user.setTemporaryPassword,
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

  it('should send the correct request and receive correct response - set active password', async () => {
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
    const resp = await management.user.setActivePassword(loginId, password);

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      apiPaths.user.setActivePassword,
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

  describe('removeAllPasskeys', () => {
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
      const resp = await management.user.removeAllPasskeys(loginId);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.removeAllPasskeys,
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

  describe('history', () => {
    it('should send the correct request and receive correct response', async () => {
      const usersHistoryRes = [
        {
          userId: 'some-id-1',
          loginTime: 12,
          city: 'aa-1',
          country: 'bb-1',
          ip: 'cc-1',
        },
        {
          userId: 'some-id-2',
          loginTime: 21,
          city: 'aa-2',
          country: 'bb-2',
          ip: 'cc-2',
        },
      ];
      const httpResponse = {
        ok: true,
        json: () => usersHistoryRes,
        clone: () => ({
          json: () => Promise.resolve(usersHistoryRes),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const userIds = ['some-id-1', 'some-id-2'];
      const resp = await management.user.history(userIds);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.user.history, userIds, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: usersHistoryRes,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
