import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

describe('Management SSO', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('getSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = {
        tenantId: 'tenant-id',
        idpEntityId: 'idpEntityId',
        domain: 'some-domain.com',
        domains: ['some-domain.com', 'some-domain2.com'],
      };
      const httpResponse = {
        ok: true,
        json: () => mockResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const tenantId = 't1';
      const resp = await management.sso.getSettings(tenantId);

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockResponse,
      });
    });
  });

  describe('deleteSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const tenantId = 't1';
      const resp = await management.sso.deleteSettings(tenantId);

      expect(mockHttpClient.delete).toHaveBeenCalledWith(apiPaths.sso.settings, {
        queryParams: { tenantId },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: {},
      });
    });
  });

  describe('configureSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 't1';
      const idpURL = 'https://idp.com';
      const idpCert = 'cert';
      const entityId = 'e1';
      const redirectURL = 'https://redirect.com';
      const domains = ['domain.com', 'app.domain.com'];
      const resp = await management.sso.configureSettings(
        tenantId,
        idpURL,
        idpCert,
        entityId,
        redirectURL,
        domains,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.settings,
        { tenantId, idpURL, idpCert, entityId, redirectURL, domains },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureMetadata', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tenantId = 't1';
      const idpMetadataURL = 'https://idp.com';
      const redirectURL = 'https://redirect.com';
      const domains = ['domain.com', 'app.domain.com'];
      const resp = await management.sso.configureMetadata(
        tenantId,
        idpMetadataURL,
        redirectURL,
        domains,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.metadata,
        {
          tenantId,
          idpMetadataURL,
          domains,
          redirectURL,
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureMapping', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.sso.configureMapping(
        't1',
        [{ groups: ['g1', 'g2'], roleName: 'role1' }],
        { name: 'IDP_NAME', email: 'IDP_MAIL' },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.mapping,
        {
          tenantId: 't1',
          roleMappings: [{ groups: ['g1', 'g2'], roleName: 'role1' }],
          attributeMapping: { name: 'IDP_NAME', email: 'IDP_MAIL' },
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureOIDCSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.sso.configureOIDCSettings(
        't1',
        {
          clientId: 'cid',
          name: 'cn',
          attributeMapping: {
            email: 'em',
          },
          redirectUrl: 'http://redirect.com',
        },
        ['a.com', 'b.com'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.oidc.configure,
        {
          tenantId: 't1',
          settings: {
            clientId: 'cid',
            name: 'cn',
            userAttrMapping: {
              email: 'em',
            },
            redirectUrl: 'http://redirect.com',
          },
          domains: ['a.com', 'b.com'],
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureSAMLSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.sso.configureSAMLSettings(
        't1',
        {
          idpUrl: 'https://idp.url',
          entityId: 'eid',
          idpCert: 'bsae64cert',
          spACSUrl: 'https://spacs.url',
          spEntityId: 'spentityid',
        },
        'http://redirect.com',
        ['a.com', 'b.com'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.saml.configure,
        {
          tenantId: 't1',
          settings: {
            idpUrl: 'https://idp.url',
            entityId: 'eid',
            idpCert: 'bsae64cert',
            spACSUrl: 'https://spacs.url',
            spEntityId: 'spentityid',
          },
          redirectUrl: 'http://redirect.com',
          domains: ['a.com', 'b.com'],
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('configureSAMLByMetadata', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.sso.configureSAMLByMetadata(
        't1',
        {
          idpMetadataUrl: 'https://metadata.com',
          attributeMapping: { name: 'IDP_NAME', email: 'IDP_MAIL' },
          spACSUrl: 'https://spacs.url',
          spEntityId: 'spentityid',
        },
        'http://redirect.com',
        ['a.com', 'b.com'],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.saml.metadata,
        {
          tenantId: 't1',
          settings: {
            idpMetadataUrl: 'https://metadata.com',
            attributeMapping: { name: 'IDP_NAME', email: 'IDP_MAIL' },
            spACSUrl: 'https://spacs.url',
            spEntityId: 'spentityid',
          },
          redirectUrl: 'http://redirect.com',
          domains: ['a.com', 'b.com'],
        },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadSettings', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockResponse = {
        tenant: {
          id: 't1',
          name: 'nm',
        },
        oidc: {
          userAttrMapping: {
            name: 'uan',
          },
        },
        saml: {
          groupsMapping: [{ groups: ['g1', 'g2'], role: { id: 'rid', name: 'rname' } }],
        },
      };
      const httpResponse = {
        ok: true,
        json: () => mockResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);
      const resp = await management.sso.loadSettings('t1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.sso.settingsv2, {
        queryParams: {
          tenantId: 't1',
        },
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: {
          tenant: {
            id: 't1',
            name: 'nm',
          },
          oidc: {
            attributeMapping: {
              name: 'uan',
            },
          },
          saml: {
            groupsMapping: [{ groups: ['g1', 'g2'], roleName: 'rname' }],
          },
        },
      });
    });
  });

  it('should send the correct request and receive correct response where there are no mappings', async () => {
    const mockResponse = {
      tenant: {
        id: 't1',
        name: 'nm',
      },
    };
    const httpResponse = {
      ok: true,
      json: () => mockResponse,
      clone: () => ({
        json: () => Promise.resolve(mockResponse),
      }),
      status: 200,
    };
    mockHttpClient.get.mockResolvedValue(httpResponse);
    const resp = await management.sso.loadSettings('t1');

    expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.sso.settingsv2, {
      queryParams: {
        tenantId: 't1',
      },
      token: 'key',
    });

    expect(resp).toEqual({
      code: 200,
      ok: true,
      response: httpResponse,
      data: mockResponse,
    });
  });
});
