import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { CreatedAccessKeyResponse, AccessKey } from './types';

const management = withManagement(mockCoreSdk, 'key');

const mockAccessKeyResponse = {
  id: 'ak1',
  name: 'foo',
  description: '123ab',
};

const mockMgmtAccessKeyResponse = {
  key: mockAccessKeyResponse,
};

const mockMgmtAccessKeysResponse = {
  keys: [mockAccessKeyResponse],
};

describe('Management Access Keys', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockMgmtCreatedAccessKeyResponse = {
        cleartext: 'abc',
        key: mockAccessKeyResponse,
      };
      const httpResponse = {
        ok: true,
        json: () => mockMgmtCreatedAccessKeyResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtCreatedAccessKeyResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreatedAccessKeyResponse> = await management.accessKey.create(
        'foo',
        123456789,
        ['r1', 'r2'],
        null,
        'uid',
        { k1: 'v1' },
        'hey',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.create,
        {
          name: 'foo',
          expireTime: 123456789,
          roleNames: ['r1', 'r2'],
          keyTenants: null,
          userId: 'uid',
          customClaims: { k1: 'v1' },
          description: 'hey',
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockMgmtCreatedAccessKeyResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('load', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtAccessKeyResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtAccessKeyResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AccessKey> = await management.accessKey.load('id');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.accessKey.load, {
        queryParams: { id: 'id' },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockAccessKeyResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('searchAll', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtAccessKeysResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtAccessKeysResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AccessKey[]> = await management.accessKey.searchAll(['t1']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.search,
        { tenantIds: ['t1'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: [mockAccessKeyResponse],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtAccessKeyResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtAccessKeyResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AccessKey> = await management.accessKey.update(
        'id',
        'name',
        'description',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.update,
        { id: 'id', name: 'name', description: 'description' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockAccessKeyResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deactivate', () => {
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

      const resp: SdkResponse<AccessKey> = await management.accessKey.deactivate('id');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.deactivate,
        { id: 'id' },
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

  describe('activate', () => {
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

      const resp: SdkResponse<AccessKey> = await management.accessKey.activate('id');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.activate,
        { id: 'id' },
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

      const resp: SdkResponse<AccessKey> = await management.accessKey.delete('id');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.accessKey.delete,
        { id: 'id' },
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
