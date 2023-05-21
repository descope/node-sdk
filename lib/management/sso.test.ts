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
      const domain = 'domain.com';
      const resp = await management.sso.configureSettings(
        tenantId,
        idpURL,
        idpCert,
        entityId,
        redirectURL,
        domain,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.settings,
        { tenantId, idpURL, idpCert, entityId, redirectURL, domain },
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
      const resp = await management.sso.configureMetadata(tenantId, idpMetadataURL);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.metadata,
        {
          tenantId,
          idpMetadataURL,
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
        { groups: ['g1', 'g2'], role: 'role1' },
        { name: 'IDP_NAME', email: 'IDP_MAIL' },
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.sso.mapping,
        {
          tenantId: 't1',
          roleMapping: { groups: ['g1', 'g2'], role: 'role1' },
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
});
