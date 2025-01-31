import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import {
  CreateThirdPartyApplicationResponse,
  ThirdPartyApplication,
  ThirdPartyApplicationConsent,
  ThirdPartyApplicationSecretResponse,
} from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockThirdPartyApplicationCreateResponse = {
  id: 'foo',
};

const mockThirdPartyApplications: ThirdPartyApplication[] = [
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

const mockThirdPartyApplicationConsents: ThirdPartyApplicationConsent[] = [
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

const mockAllThirdPartyApplicationsResponse = {
  apps: mockThirdPartyApplications,
};

const mockThirdPartyApplicationConsentsResponse = {
  consents: mockThirdPartyApplicationConsents,
};

describe('Management ThirdPartyApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('createThirdPartyApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockThirdPartyApplicationCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockThirdPartyApplicationCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreateThirdPartyApplicationResponse> =
        await management.thirdPartyApplication.createApplication({
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
        apiPaths.thirdPartyApplication.create,
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
        data: mockThirdPartyApplicationCreateResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateThirdPartyApplication', () => {
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

      const resp = await management.thirdPartyApplication.updateApplication({
        id: 'app1',
        name: 'name',
        permissionsScopes: [],
        logo: 'logo',
        description: 'desc',
        approvedCallbackUrls: ['test.com'],
        loginPageUrl: 'http://dummy.com',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplication.update,
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

  describe('patchThirdPartyApplication', () => {
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

      const resp = await management.thirdPartyApplication.patchApplication({
        id: 'app1',
        logo: 'logo',
        description: 'desc',
        loginPageUrl: 'http://dummy.com',
        permissionsScopes: [],
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplication.patch,
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

  describe('deleteThirdPartyApplication', () => {
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

      const resp = await management.thirdPartyApplication.deleteApplication('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplication.delete,
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

  describe('loadThirdPartyApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockThirdPartyApplications[0],
        clone: () => ({
          json: () => Promise.resolve(mockThirdPartyApplications[0]),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ThirdPartyApplication> =
        await management.thirdPartyApplication.loadApplication(mockThirdPartyApplications[0].id);

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.thirdPartyApplication.load, {
        queryParams: { id: mockThirdPartyApplications[0].id },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockThirdPartyApplications[0],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('getThirdPartyApplicationSecret', () => {
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

      const resp: SdkResponse<ThirdPartyApplicationSecretResponse> =
        await management.thirdPartyApplication.getApplicationSecret(
          mockThirdPartyApplications[0].id,
        );

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.thirdPartyApplication.secret, {
        queryParams: { id: mockThirdPartyApplications[0].id },
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

  describe('rotateThirdPartyApplication', () => {
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

      const resp = await management.thirdPartyApplication.rotateApplicationSecret('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplication.rotate,
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

  describe('loadAllThirdPartyApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllThirdPartyApplicationsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllThirdPartyApplicationsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ThirdPartyApplication[]> =
        await management.thirdPartyApplication.loadAllApplications();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.thirdPartyApplication.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockThirdPartyApplications,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('searchThirdPartyApplicationConsents', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockThirdPartyApplicationConsentsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockThirdPartyApplicationConsentsResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ThirdPartyApplicationConsent[]> =
        await management.thirdPartyApplication.searchConsents({
          appId: 'app1',
          userId: 'user1',
          consentId: 'consent1',
          page: 1,
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplicationConsents.search,
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
        data: mockThirdPartyApplicationConsents,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteThirdPartyApplicationConsents', () => {
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

      const resp: SdkResponse<ThirdPartyApplicationConsent[]> =
        await management.thirdPartyApplication.deleteConsents({
          appId: 'app1',
          userIds: ['user1'],
          consentIds: ['consent1'],
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.thirdPartyApplicationConsents.delete,
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
