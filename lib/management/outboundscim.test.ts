import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { OutboundSCIMConfiguration } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockOutboundSCIMConfig: OutboundSCIMConfiguration = {
  id: 'scim1',
  name: 'ACME SCIM',
  appId: 'app1',
  configuration: { baseUrl: 'https://scim.example.com', token: 'shh' },
  enabled: true,
  lastExportTime: 1_700_000_000,
  lastProcessingTime: 1_700_000_100,
  failures: 0,
  version: 3,
};

const mockOutboundSCIMConfigResponse = {
  configuration: mockOutboundSCIMConfig,
};

const mockAllOutboundSCIMConfigsResponse = {
  configurations: [
    mockOutboundSCIMConfig,
    { ...mockOutboundSCIMConfig, id: 'scim2', name: 'Widgets SCIM' },
  ],
};

describe('Management OutboundSCIM', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('createConfiguration', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundSCIMConfiguration> =
        await management.outboundSCIM.createConfiguration({
          name: 'ACME SCIM',
          appId: 'app1',
          configuration: { baseUrl: 'https://scim.example.com', token: 'shh' },
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.create, {
        name: 'ACME SCIM',
        appId: 'app1',
        configuration: { baseUrl: 'https://scim.example.com', token: 'shh' },
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateConfiguration', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundSCIMConfiguration> =
        await management.outboundSCIM.updateConfiguration({
          id: 'scim1',
          name: 'ACME SCIM v2',
          configuration: { baseUrl: 'https://scim2.example.com', token: 'shh2' },
          version: 3,
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.update, {
        id: 'scim1',
        name: 'ACME SCIM v2',
        configuration: { baseUrl: 'https://scim2.example.com', token: 'shh2' },
        version: 3,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
        ok: true,
        response: httpResponse,
      });
    });

    it('should send update without name when omitted', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundSCIM.updateConfiguration({
        id: 'scim1',
        configuration: { baseUrl: 'https://scim.example.com' },
        version: 5,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.update, {
        id: 'scim1',
        configuration: { baseUrl: 'https://scim.example.com' },
        version: 5,
      });
    });
  });

  describe('deleteConfiguration', () => {
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

      const resp = await management.outboundSCIM.deleteConfiguration('scim1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.delete, {
        id: 'scim1',
      });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadConfiguration', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundSCIMConfiguration> =
        await management.outboundSCIM.loadConfiguration('scim1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `${apiPaths.outboundSCIM.load}/scim1`,
      );

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAllConfigurations', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllOutboundSCIMConfigsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllOutboundSCIMConfigsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundSCIMConfiguration[]> =
        await management.outboundSCIM.loadAllConfigurations();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.outboundSCIM.loadAll, {});

      expect(resp).toEqual({
        code: 200,
        data: mockAllOutboundSCIMConfigsResponse.configurations,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('setEnabled', () => {
    it('should send the correct request when enabling', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<OutboundSCIMConfiguration> =
        await management.outboundSCIM.setEnabled('scim1', true);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.setEnabled, {
        id: 'scim1',
        enabled: true,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
        ok: true,
        response: httpResponse,
      });
    });

    it('should send the correct request when disabling', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockOutboundSCIMConfigResponse,
        clone: () => ({
          json: () => Promise.resolve(mockOutboundSCIMConfigResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.outboundSCIM.setEnabled('scim1', false);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.setEnabled, {
        id: 'scim1',
        enabled: false,
      });
    });
  });
});
