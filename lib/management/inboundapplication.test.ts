import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import {
  CreateInboundApplicationResponse,
  InboundApplication,
  InboundApplicationConsent,
  InboundApplicationSecretResponse,
} from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockInboundApplicationCreateResponse = {
  id: 'foo',
  cleartext: 'bar',
  clientId: 'baz',
};

const mockInboundApplications: InboundApplication[] = [
  {
    id: 'app1',
    name: 'App1',
    description: '',
    logo: null,
    clientId: 'my-client-1',
    loginPageUrl: 'http://dummy.com',
    permissionsScopes: [],
    approvedCallbackUrls: ['test.com'],
  },
  {
    id: 'app2',
    name: 'App2',
    description: '',
    logo: null,
    clientId: 'my-client-1',
    loginPageUrl: 'http://dummy.com',
    permissionsScopes: [{ name: 'scope1', description: 'scope1 description' }],
    attributesScopes: [{ name: 'attr1', description: 'attr1 description' }],
  },
];

const mockInboundApplicationConsents: InboundApplicationConsent[] = [
  {
    id: 'app1',
    appId: 'app1',
    userId: 'user1',
    scopes: ['scope1'],
    grantedBy: 'user1',
    createdTime: new Date().getTime(),
  },
  {
    id: 'app2',
    appId: 'app2',
    userId: 'user2',
    scopes: ['scope1'],
    grantedBy: 'user2',
    createdTime: new Date().getTime(),
  },
];

const mockAllInboundApplicationsResponse = {
  apps: mockInboundApplications,
};

const mockInboundApplicationConsentsResponse = {
  consents: mockInboundApplicationConsents,
};

describe('Management InboundApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('createInboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockInboundApplicationCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockInboundApplicationCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreateInboundApplicationResponse> =
        await management.inboundApplication.createApplication({
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          permissionsScopes: [
            {
              name: 'scope1',
              description: 'scope1 description',
            },
          ],
          description: 'test',
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplication.create,
        {
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          permissionsScopes: [
            {
              name: 'scope1',
              description: 'scope1 description',
            },
          ],
          description: 'test',
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockInboundApplicationCreateResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateInboundApplication', () => {
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

      const resp = await management.inboundApplication.updateApplication({
        id: 'app1',
        name: 'name',
        permissionsScopes: [],
        logo: 'logo',
        description: 'desc',
        approvedCallbackUrls: ['test.com'],
        loginPageUrl: 'http://dummy.com',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplication.update,
        {
          id: 'app1',
          name: 'name',
          permissionsScopes: [],
          logo: 'logo',
          description: 'desc',
          approvedCallbackUrls: ['test.com'],
          loginPageUrl: 'http://dummy.com',
        },
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

  describe('patchInboundApplication', () => {
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

      const resp = await management.inboundApplication.patchApplication({
        id: 'app1',
        logo: 'logo',
        description: 'desc',
        loginPageUrl: 'http://dummy.com',
        permissionsScopes: [],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplication.patch,
        {
          id: 'app1',
          permissionsScopes: [],
          logo: 'logo',
          description: 'desc',
          loginPageUrl: 'http://dummy.com',
        },
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

  describe('deleteInboundApplication', () => {
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

      const resp = await management.inboundApplication.deleteApplication('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplication.delete,
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

  describe('loadInboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockInboundApplications[0],
        clone: () => ({
          json: () => Promise.resolve(mockInboundApplications[0]),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<InboundApplication> =
        await management.inboundApplication.loadApplication(mockInboundApplications[0].id);

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.inboundApplication.load, {
        queryParams: { id: mockInboundApplications[0].id },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockInboundApplications[0],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('getInboundApplicationSecret', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {
          '1';
        },
        clone: () => ({
          json: () => Promise.resolve({ cleartext: '1' }),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<InboundApplicationSecretResponse> =
        await management.inboundApplication.getApplicationSecret(mockInboundApplications[0].id);

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.inboundApplication.secret, {
        queryParams: { id: mockInboundApplications[0].id },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: { cleartext: '1' },
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('rotateInboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {
          '1';
        },
        clone: () => ({
          json: () => Promise.resolve({ cleartext: '1' }),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.inboundApplication.rotateApplicationSecret('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplication.rotate,
        { id: 'app1' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: { cleartext: '1' },
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAllInboundApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllInboundApplicationsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllInboundApplicationsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<InboundApplication[]> =
        await management.inboundApplication.loadAllApplications();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.inboundApplication.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockInboundApplications,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('searchInboundApplicationConsents', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockInboundApplicationConsentsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockInboundApplicationConsentsResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<InboundApplicationConsent[]> =
        await management.inboundApplication.searchConsents({
          appId: 'app1',
          userId: 'user1',
          consentId: 'consent1',
          page: 1,
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplicationConsents.search,
        {
          appId: 'app1',
          userId: 'user1',
          consentId: 'consent1',
          page: 1,
        },
        {
          token: 'key',
        },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockInboundApplicationConsents,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteInboundApplicationConsents', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => {},
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<InboundApplicationConsent[]> =
        await management.inboundApplication.deleteConsents({
          appId: 'app1',
          userIds: ['user1'],
          consentIds: ['consent1'],
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.inboundApplicationConsents.delete,
        {
          appId: 'app1',
          userIds: ['user1'],
          consentIds: ['consent1'],
        },
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
});
