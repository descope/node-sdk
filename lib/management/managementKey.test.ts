import { SdkResponse } from '@descope/core-js-sdk';
import { MgmtKey, MgmtKeyCreateResponse } from './types';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockMgmtKey: MgmtKey = {
  id: 'mk1',
  name: 'test-key',
  description: 'desc',
  status: 'active',
  createdTime: 123,
  expireTime: 456,
  permittedIps: ['1.2.3.4'],
  reBac: {
    companyRoles: ['role1'],
  },
  version: 1,
  authzVersion: 1,
};

describe('Management Management Keys', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockCreateResponse: MgmtKeyCreateResponse = {
        cleartext: 'secret',
        key: mockMgmtKey,
      };
      const httpResponse = {
        ok: true,
        json: () => mockCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.put.mockResolvedValue(httpResponse);

      const resp: SdkResponse<MgmtKeyCreateResponse> = await management.managementKey.create(
        'test-key',
        'desc',
        456,
        ['1.2.3.4'],
        { companyRoles: ['role1'] },
      );

      expect(mockHttpClient.put).toHaveBeenCalledWith(apiPaths.managementKey.create, {
        name: 'test-key',
        description: 'desc',
        expiresIn: 456,
        permittedIps: ['1.2.3.4'],
        reBac: { companyRoles: ['role1'] },
      });
      expect(resp.data).toEqual(mockCreateResponse);
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ key: mockMgmtKey }),
        clone: () => ({
          json: () => Promise.resolve({ key: mockMgmtKey }),
        }),
        status: 200,
      };
      mockHttpClient.patch.mockResolvedValue(httpResponse);

      const resp = await management.managementKey.update(
        'mk1',
        'updated-key',
        'updated-desc',
        ['1.1.1.1'],
        'inactive',
      );

      expect(mockHttpClient.patch).toHaveBeenCalledWith(apiPaths.managementKey.update, {
        id: 'mk1',
        name: 'updated-key',
        description: 'updated-desc',
        permittedIps: ['1.1.1.1'],
        status: 'inactive',
      });
      expect(resp.data.key).toEqual(mockMgmtKey);
    });
  });

  describe('delete', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.managementKey.delete(['mk1', 'mk2']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.managementKey.delete, {
        ids: ['mk1', 'mk2'],
      });
    });
  });

  describe('load', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ key: mockMgmtKey }),
        clone: () => ({
          json: () => Promise.resolve({ key: mockMgmtKey }),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp = await management.managementKey.load('mk1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.managementKey.load, {
        queryParams: { id: 'mk1' },
      });
      expect(resp.data.key).toEqual(mockMgmtKey);
    });
  });

  describe('search', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ keys: [mockMgmtKey] }),
        clone: () => ({
          json: () => Promise.resolve({ keys: [mockMgmtKey] }),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp = await management.managementKey.search({});

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.managementKey.search, {
        queryParams: {},
      });
      expect(resp.data.keys).toEqual([mockMgmtKey]);
    });
  });
});
