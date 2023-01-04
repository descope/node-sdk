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
        'identifier',
        'a@b.c',
        null,
        null,
        ['r1', 'r2'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.create,
        {
          identifier: 'identifier',
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

      const resp: SdkResponse<UserResponse> = await management.user.update('identifier', 'a@b.c');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.update,
        { identifier: 'identifier', email: 'a@b.c' },
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

      const resp: SdkResponse<UserResponse> = await management.user.delete('identifier');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.user.delete,
        { identifier: 'identifier' },
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

      const resp: SdkResponse<UserResponse> = await management.user.load('identifier');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.user.load, {
        queryParams: { identifier: 'identifier' },
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
});
