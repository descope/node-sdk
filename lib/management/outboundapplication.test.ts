import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { OutboundApplication, OutboundAppToken } from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockOutboundApplicationResponse = {
  app: {
    id: 'foo',
    name: 'Test App',
    description: 'This is a test application',
  },
};

const mockOutboundApplications: OutboundApplication[] = [
  {
    id: 'app1',
    name: 'App1',
    description: '',
    logo: null,
  },
  {
    id: 'app2',
    name: 'App2',
    description: '',
    logo: null,
  },
];

const mockAllOutboundApplicationsResponse = {
  apps: mockOutboundApplications,
};

const mockOutboundAppToken: OutboundAppToken = {
  id: 'mock-token-id',
  appId: 'mock-app-id',
  userId: 'mock-user-id',
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  hasRefreshToken: true,
  accessTokenExpiry: 3600,
  scopes: ['read', 'write'],
  grantedBy: 'mock-granted-by',
};

const mockFetchTokenResponse = {
  token: mockOutboundAppToken,
};

describe('Management OutboundApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('createOutboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundApplicationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundApplicationResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundApplication> =
        await management.outboundApplication.createApplication({
          name: 'name',
          description: 'test',
          clientSecret: 'shhh..',
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.create,
        {
          name: 'name',
          description: 'test',
          clientSecret: 'shhh..',
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateOutboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundApplicationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundApplicationResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.outboundApplication.updateApplication({
        id: 'app1',
        name: 'name',
        logo: 'logo',
        description: 'desc',
        clientSecret: 'shhh..',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.update,
        {
          app: {
            id: 'app1',
            name: 'name',
            logo: 'logo',
            description: 'desc',
            clientSecret: 'shhh..',
          },
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteOutboundApplication', () => {
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

      const resp = await management.outboundApplication.deleteApplication('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.delete,
        { id: 'app1' },
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

  describe('loadOutboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundApplicationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundApplicationResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundApplication> =
        await management.outboundApplication.loadApplication(
          mockOutboundApplicationResponse.app.id,
        );

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${apiPaths.outboundApplication.load}/${mockOutboundApplicationResponse.app.id}`,
        {
          token: 'key',
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAllOutboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllOutboundApplicationsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllOutboundApplicationsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundApplication[]> =
        await management.outboundApplication.loadAllApplications();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.outboundApplication.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplications,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('fetchTokenByScopes', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTokenByScopes(
          'app123',
          'user456',
          ['read', 'write'],
          { refreshToken: true },
          'tenant789',
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTokenByScopes,
        {
          appId: 'app123',
          userId: 'user456',
          scopes: ['read', 'write'],
          options: { refreshToken: true },
          tenantId: 'tenant789',
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with minimal parameters', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTokenByScopes('app123', 'user456', ['read']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTokenByScopes,
        {
          appId: 'app123',
          userId: 'user456',
          scopes: ['read'],
          options: undefined,
          tenantId: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('fetchToken', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> = await management.outboundApplication.fetchToken(
        'app123',
        'user456',
        'tenant789',
        { forceRefresh: true },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchToken,
        {
          appId: 'app123',
          userId: 'user456',
          tenantId: 'tenant789',
          options: { forceRefresh: true },
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with minimal parameters', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> = await management.outboundApplication.fetchToken(
        'app123',
        'user456',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchToken,
        {
          appId: 'app123',
          userId: 'user456',
          tenantId: undefined,
          options: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('fetchTenantTokenByScopes', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTenantTokenByScopes(
          'app123',
          'tenant789',
          ['read', 'write'],
          { refreshToken: true },
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTenantTokenByScopes,
        {
          appId: 'app123',
          tenantId: 'tenant789',
          scopes: ['read', 'write'],
          options: { refreshToken: true },
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with minimal parameters', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTenantTokenByScopes('app123', 'tenant789', [
          'read',
        ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTenantTokenByScopes,
        {
          appId: 'app123',
          tenantId: 'tenant789',
          scopes: ['read'],
          options: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('fetchTenantToken', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTenantToken('app123', 'tenant789', {
          forceRefresh: true,
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTenantToken,
        {
          appId: 'app123',
          tenantId: 'tenant789',
          options: { forceRefresh: true },
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with minimal parameters', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFetchTokenResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFetchTokenResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundAppToken> =
        await management.outboundApplication.fetchTenantToken('app123', 'tenant789');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTenantToken,
        {
          appId: 'app123',
          tenantId: 'tenant789',
          options: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
