import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { CreateTenantResponse } from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockTenantCreateResponse = {
  tenantId: 'foo',
};

describe('Management Tenant', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockTenantCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockTenantCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreateTenantResponse> = await management.tenant.create('name', [
        'd1',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.create,
        { name: 'name', selfProvisioningDomains: ['d1'] },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockTenantCreateResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createWithId', () => {
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

      const resp: SdkResponse<CreateTenantResponse> = await management.tenant.createWithId(
        't1',
        'name',
        ['d1'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.create,
        { tenantId: 't1', name: 'name', selfProvisioningDomains: ['d1'] },
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

  describe('update', () => {
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

      const resp = await management.tenant.update('t1', 'name', ['d1']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.update,
        { tenantId: 't1', name: 'name', selfProvisioningDomains: ['d1'] },
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

      const resp = await management.tenant.delete('t1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.delete,
        { tenantId: 't1' },
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
