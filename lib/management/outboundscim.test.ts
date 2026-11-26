import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { OutboundSCIMConfiguration } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockOutboundSCIMConfig: OutboundSCIMConfiguration = {
  appId: 'app1',
  configuration: {
    baseUrl: 'https://scim.example.com',
    authentication: { method: 'bearerToken', bearerToken: 'shh' },
  },
  enabled: true,
  lastExportTime: 1_700_000_000,
  lastProcessingTime: 1_700_000_100,
  failures: 0,
  version: 3,
};

const mockOutboundSCIMConfigResponse = {
  configuration: mockOutboundSCIMConfig,
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
          appId: 'app1',
          configuration: {
            baseUrl: 'https://scim.example.com',
            authentication: { method: 'bearerToken', bearerToken: 'shh' },
          },
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.create, {
        appId: 'app1',
        configuration: {
          baseUrl: 'https://scim.example.com',
          authentication: { method: 'bearerToken', bearerToken: 'shh' },
        },
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
          appId: 'app1',
          configuration: {
            baseUrl: 'https://scim2.example.com',
            authentication: { method: 'bearerToken', bearerToken: 'shh2' },
          },
          version: 3,
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.update, {
        appId: 'app1',
        configuration: {
          baseUrl: 'https://scim2.example.com',
          authentication: { method: 'bearerToken', bearerToken: 'shh2' },
        },
        version: 3,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
        ok: true,
        response: httpResponse,
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

      const resp = await management.outboundSCIM.deleteConfiguration('app1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.delete, {
        appId: 'app1',
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
        await management.outboundSCIM.loadConfiguration('app1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(`${apiPaths.outboundSCIM.load}/app1`);

      expect(resp).toEqual({
        code: 200,
        data: mockOutboundSCIMConfig,
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

      const resp: SdkResponse<OutboundSCIMConfiguration> = await management.outboundSCIM.setEnabled(
        'app1',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.setEnabled, {
        appId: 'app1',
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

      await management.outboundSCIM.setEnabled('app1', false);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.outboundSCIM.setEnabled, {
        appId: 'app1',
        enabled: false,
      });
    });
  });
});
