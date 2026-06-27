import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { OutboundApplication, OutboundAppToken } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

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
    resetMockHttpClient();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.create, {
        name: 'name',
        description: 'test',
        clientSecret: 'shhh..',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });

    it('should pass through DCR fields (useDcr/dcrUrl) without a cast', async () => {
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
          name: 'dcr app',
          description: 'custom MCP server with dynamic client registration',
          useDcr: true,
          dcrUrl: 'https://mcp.example.com/register',
          pkce: true,
          defaultRedirectUrl: 'https://api.descope.com/v1/outbound/oauth/callback',
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.create, {
        name: 'dcr app',
        description: 'custom MCP server with dynamic client registration',
        useDcr: true,
        dcrUrl: 'https://mcp.example.com/register',
        pkce: true,
        defaultRedirectUrl: 'https://api.descope.com/v1/outbound/oauth/callback',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createOutboundApplicationByTemplate', () => {
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
        await management.outboundApplication.createApplicationByTemplate({
          templateId: 'hubspot',
          id: 'hubspot',
          clientId: 'client-id',
          clientSecret: 'shhh..',
          tenantId: 'tenant789',
          overrides: {
            name: 'HubSpot',
            defaultScopes: ['crm.objects.contacts.read'],
            pkce: true,
          },
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.createByTemplate,
        {
          templateId: 'hubspot',
          id: 'hubspot',
          clientId: 'client-id',
          clientSecret: 'shhh..',
          tenantId: 'tenant789',
          overrides: {
            name: 'HubSpot',
            defaultScopes: ['crm.objects.contacts.read'],
            pkce: true,
          },
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundApplicationResponse.app,
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with only templateId', async () => {
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
        await management.outboundApplication.createApplicationByTemplate({
          templateId: 'google',
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.createByTemplate,
        {
          templateId: 'google',
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.update, {
        app: {
          id: 'app1',
          name: 'name',
          logo: 'logo',
          description: 'desc',
          clientSecret: 'shhh..',
        },
      });

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.delete, {
        id: 'app1',
      });

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

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.outboundApplication.loadAll, {});

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
          { withRefreshToken: true, forceRefresh: true },
          'tenant789',
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTokenByScopes,
        {
          appId: 'app123',
          userId: 'user456',
          scopes: ['read', 'write'],
          options: { withRefreshToken: true, forceRefresh: true },
          tenantId: 'tenant789',
        },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.fetchToken, {
        appId: 'app123',
        userId: 'user456',
        tenantId: 'tenant789',
        options: { forceRefresh: true },
      });

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundApplication.fetchToken, {
        appId: 'app123',
        userId: 'user456',
        tenantId: undefined,
        options: undefined,
      });

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
          { withRefreshToken: true, forceRefresh: true },
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.fetchTenantTokenByScopes,
        {
          appId: 'app123',
          tenantId: 'tenant789',
          scopes: ['read', 'write'],
          options: { withRefreshToken: true, forceRefresh: true },
        },
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
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundAppToken,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteUserTokens', () => {
    it('should send the correct request with both appId and userId', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp = await management.outboundApplication.deleteUserTokens('app123', 'user456');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        apiPaths.outboundApplication.deleteUserTokens,
        {
          queryParams: { appId: 'app123', userId: 'user456' },
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with only appId', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp = await management.outboundApplication.deleteUserTokens('app123');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        apiPaths.outboundApplication.deleteUserTokens,
        {
          queryParams: { appId: 'app123', userId: undefined },
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });

    it('should work with only userId', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp = await management.outboundApplication.deleteUserTokens(undefined, 'user456');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        apiPaths.outboundApplication.deleteUserTokens,
        {
          queryParams: { appId: undefined, userId: 'user456' },
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteTokenById', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp = await management.outboundApplication.deleteTokenById('token123');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        apiPaths.outboundApplication.deleteTokenById,
        {
          queryParams: { id: 'token123' },
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('listAppsWithUserToken', () => {
    it('should send the correct request and return the app ids', async () => {
      const listResponse = { appIds: ['app1', 'app2'] };
      const httpResponse = {
        ok: true,
        json: () => listResponse,
        clone: () => ({ json: () => Promise.resolve(listResponse) }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<string[]> =
        await management.outboundApplication.listAppsWithUserToken('user456', 'tenant789');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        apiPaths.outboundApplication.listAppsWithUserToken,
        { queryParams: { userId: 'user456', tenantId: 'tenant789' } },
      );

      expect(resp).toEqual({
        code: 200,
        data: ['app1', 'app2'],
        ok: true,
        response: httpResponse,
      });
    });

    it('should omit tenantId when not provided', async () => {
      const listResponse = { appIds: ['app1'] };
      const httpResponse = {
        ok: true,
        json: () => listResponse,
        clone: () => ({ json: () => Promise.resolve(listResponse) }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      await management.outboundApplication.listAppsWithUserToken('user456');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        apiPaths.outboundApplication.listAppsWithUserToken,
        { queryParams: { userId: 'user456' } },
      );
    });
  });

  describe('uploadUserApiKey', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({ json: () => Promise.resolve({}) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundApplication.uploadUserApiKey(
        'app123',
        'user456',
        'secret-key',
        'tenant789',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.uploadUserApiKey,
        { appId: 'app123', userId: 'user456', apiKey: 'secret-key', tenantId: 'tenant789' },
      );
    });
  });

  describe('uploadTenantApiKey', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({ json: () => Promise.resolve({}) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundApplication.uploadTenantApiKey('app123', 'tenant789', 'secret-key');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.uploadTenantApiKey,
        { appId: 'app123', tenantId: 'tenant789', apiKey: 'secret-key' },
      );
    });
  });

  describe('uploadUserToken', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({ json: () => Promise.resolve({}) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundApplication.uploadUserToken({
        appId: 'app123',
        userId: 'user456',
        refreshToken: 'refresh',
        scopes: ['read'],
        verifyRefresh: true,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.uploadUserToken,
        {
          appId: 'app123',
          userId: 'user456',
          refreshToken: 'refresh',
          scopes: ['read'],
          verifyRefresh: true,
        },
      );
    });
  });

  describe('uploadTenantToken', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({ json: () => Promise.resolve({}) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundApplication.uploadTenantToken({
        appId: 'app123',
        tenantId: 'tenant789',
        accessToken: 'access',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.uploadTenantToken,
        { appId: 'app123', tenantId: 'tenant789', accessToken: 'access' },
      );
    });
  });

  describe('batchUploadUserTokens', () => {
    it('should send the tokens and return failures', async () => {
      const batchResponse = {
        failures: [
          { appId: 'app123', userId: 'user2', errorCode: 'E152110', reason: 'bad token' },
        ],
      };
      const httpResponse = {
        ok: true,
        json: () => batchResponse,
        clone: () => ({ json: () => Promise.resolve(batchResponse) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tokens = [
        { appId: 'app123', userId: 'user1', accessToken: 'a1' },
        { appId: 'app123', userId: 'user2', accessToken: 'a2' },
      ];
      const resp = await management.outboundApplication.batchUploadUserTokens(tokens);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.batchUploadUserTokens,
        { tokens },
      );

      expect(resp).toEqual({
        code: 200,
        data: batchResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('batchUploadTenantTokens', () => {
    it('should send the tokens', async () => {
      const batchResponse = { failures: [] };
      const httpResponse = {
        ok: true,
        json: () => batchResponse,
        clone: () => ({ json: () => Promise.resolve(batchResponse) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tokens = [{ appId: 'app123', tenantId: 'tenant1', accessToken: 'a1' }];
      const resp = await management.outboundApplication.batchUploadTenantTokens(tokens);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.batchUploadTenantTokens,
        { tokens },
      );

      expect(resp.data).toEqual(batchResponse);
    });
  });
});
