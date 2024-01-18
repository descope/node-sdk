import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { CreateSSOApplicationResponse, SSOApplication } from './types';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

const mockSSOApplicationCreateResponse = {
  id: 'foo',
};

const mockSSOApplications = [
  {
    id: 'app1',
    name: 'App1',
    description: '',
    enabled: true,
    logo: null,
    appType: 'saml',
    samlSettings: {
      loginPageUrl: 'http://dummy.com/login',
      idpCert: 'cert',
      useMetadataInfo: true,
      metadataUrl: 'http://dummy.com/metadata',
      entityId: null,
      acsUrl: null,
      certificate: null,
      attributeMapping: [{ name: 'email', type: '', value: 'attrVal1' }],
      groupsMapping: [
        {
          name: 'grp1',
          type: '',
          filterType: 'roles',
          value: '',
          roles: [{ id: 'myRoleId', name: 'myRole' }],
        },
      ],
      idpMetadataUrl: '',
      idpEntityId: '',
      idpSsoUrl: '',
      acsAllowedCallbacks: [],
      subjectNameIdType: '',
      subjectNameIdFormat: '',
    },
    oidcSettings: null,
  },
  {
    id: 'app2',
    name: 'App2',
    description: '',
    enabled: true,
    logo: null,
    appType: 'oidc',
    samlSettings: null,
    oidcSettings: {
      loginPageUrl: 'http://dummy.com/login',
      issuer: 'http://dummy.com/issuer',
      discoveryUrl: 'http://dummy/discovery',
    },
  },
];

const mockAllSSOApplicationsResponse = {
  apps: mockSSOApplications,
};

describe('Management SSOApplication', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('createOidcApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockSSOApplicationCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockSSOApplicationCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreateSSOApplicationResponse> =
        await management.ssoApplication.createOidcApplication('name', 'http://dummy.com');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.ssoApplication.oidcCreate,
        {
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          id: undefined,
          description: undefined,
          enabled: true,
          logo: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockSSOApplicationCreateResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createSamlApplication', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockSSOApplicationCreateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockSSOApplicationCreateResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<CreateSSOApplicationResponse> =
        await management.ssoApplication.createSamlApplication(
          'name',
          'http://dummy.com',
          undefined,
          undefined,
          undefined,
          true,
          true,
          'http://dummy.com/metadata',
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.ssoApplication.samlCreate,
        {
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          id: undefined,
          description: undefined,
          logo: undefined,
          enabled: true,
          useMetadataInfo: true,
          metadataUrl: 'http://dummy.com/metadata',
          entityId: undefined,
          acsUrl: undefined,
          certificate: undefined,
          attributeMapping: undefined,
          groupsMapping: undefined,
          acsAllowedCallbacks: undefined,
          subjectNameIdType: undefined,
          subjectNameIdFormat: undefined,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockSSOApplicationCreateResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateOidcApplication', () => {
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

      const resp = await management.ssoApplication.updateOidcApplication(
        'app1',
        'name',
        'http://dummy.com',
        undefined,
        undefined,
        false,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.ssoApplication.oidcUpdate,
        {
          id: 'app1',
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          description: undefined,
          enabled: false,
          logo: undefined,
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

  describe('updateSamlApplication', () => {
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

      const resp = await management.ssoApplication.updateSamlApplication(
        'app1',
        'name',
        'http://dummy.com',
        undefined,
        undefined,
        true,
        false,
        undefined,
        'ent1234',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.ssoApplication.samlUpdate,
        {
          id: 'app1',
          name: 'name',
          loginPageUrl: 'http://dummy.com',
          description: undefined,
          logo: undefined,
          enabled: true,
          useMetadataInfo: false,
          metadataUrl: undefined,
          entityId: 'ent1234',
          acsUrl: undefined,
          certificate: undefined,
          attributeMapping: undefined,
          groupsMapping: undefined,
          acsAllowedCallbacks: undefined,
          subjectNameIdType: undefined,
          subjectNameIdFormat: undefined,
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

      const resp = await management.ssoApplication.delete('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.ssoApplication.delete,
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

  describe('load', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockSSOApplications[0],
        clone: () => ({
          json: () => Promise.resolve(mockSSOApplications[0]),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<SSOApplication> = await management.ssoApplication.load(
        mockSSOApplications[0].id,
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.ssoApplication.load, {
        queryParams: { id: mockSSOApplications[0].id },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockSSOApplications[0],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAll', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllSSOApplicationsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllSSOApplicationsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<SSOApplication[]> = await management.ssoApplication.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.ssoApplication.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockSSOApplications,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
