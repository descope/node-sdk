import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import {
  CreateTenantResponse,
  GenerateSSOConfigurationLinkResponse,
  Tenant,
  TenantSettings,
} from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockTenantCreateResponse = {
  tenantId: 'foo',
};

const mockTenants = [
  { id: 't1', name: 'name1', selfProvisioningDomains: ['domain1.com'] },
  { id: 't2', name: 'name2', selfProvisioningDomains: ['domain2.com'] },
  { id: 't3', name: 'name3', selfProvisioningDomains: ['domain3.com'] },
];

const mockSettings: TenantSettings = {
  domains: ['domain1.com'],
  selfProvisioningDomains: ['domain1.com'],
  sessionSettingsEnabled: true,
  refreshTokenExpiration: 12,
  refreshTokenExpirationUnit: 'days',
  sessionTokenExpiration: 10,
  sessionTokenExpirationUnit: 'minutes',
  enableInactivity: true,
  JITDisabled: false,
  InactivityTime: 10,
  InactivityTimeUnit: 'minutes',
};

const mockAllTenantsResponse = {
  tenants: mockTenants,
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
        { id: 't1', name: 'name', selfProvisioningDomains: ['d1'] },
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
        { id: 't1', name: 'name', selfProvisioningDomains: ['d1'] },
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

      const resp = await management.tenant.delete('t1', true);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.delete,
        { id: 't1', cascade: true },
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
        json: () => mockTenants[0],
        clone: () => ({
          json: () => Promise.resolve(mockTenants[0]),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Tenant> = await management.tenant.load(mockTenants[0].id);

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.tenant.load, {
        queryParams: { id: mockTenants[0].id },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockTenants[0],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAll', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllTenantsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllTenantsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Tenant[]> = await management.tenant.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.tenant.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockTenants,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('getSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockSettings,
        clone: () => ({
          json: () => Promise.resolve(mockSettings),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<TenantSettings> = await management.tenant.getSettings('test');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.tenant.settings, {
        queryParams: { id: 'test' },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockSettings,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.tenant.configureSettings(
        'test',
        mockSettings,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.settings,
        { ...mockSettings, tenantId: 'test' },
        {
          token: 'key',
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: undefined,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('generateSSOConfigurationLink', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({
          adminSSOConfigurationLink: 'some link',
        }),
        clone: () => ({
          json: () => Promise.resolve({ adminSSOConfigurationLink: 'some link' }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<GenerateSSOConfigurationLinkResponse> =
        await management.tenant.generateSSOConfigurationLink('test', 60 * 60 * 24);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.tenant.generateSSOConfigurationLink,
        { tenantId: 'test', expireTime: 60 * 60 * 24 },
        {
          token: 'key',
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: { adminSSOConfigurationLink: 'some link' },
        ok: true,
        response: httpResponse,
      });
    });
  });
});
