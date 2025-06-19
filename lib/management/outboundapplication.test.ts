import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { OutboundApplication } from './types';
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
        });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.create,
        {
          name: 'name',
          description: 'test',
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
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.outboundApplication.update,
        {
          app: {
            id: 'app1',
            name: 'name',
            logo: 'logo',
            description: 'desc',
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
});
