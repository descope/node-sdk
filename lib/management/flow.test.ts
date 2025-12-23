import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import {
  FlowResponse,
  FlowsResponse,
  Flow,
  Screen,
  Theme,
  ThemeResponse,
  FlowMetadata,
} from './types';

const management = withManagement(mockHttpClient);

const mockFlow: Flow = {
  dsl: {},
  id: 'test',
  name: 'mockFlow',
  disabled: false,
};

const mockFlowMetadata: FlowMetadata = {
  id: 'test',
  name: 'mockFlow',
  disabled: false,
};

const mockScreen: Screen = {
  flowId: mockFlow.id,
  htmlTemplate: {},
  id: 'mockScreen',
};

const mockFlowsResponse: FlowsResponse = {
  flows: [mockFlowMetadata],
  total: 1,
};

const mockFlowResponse: FlowResponse = {
  flow: mockFlow,
  screens: [mockScreen],
};

const mockRunFlowResponse = {
  output: { result: 'success' },
};

const mockTheme: Theme = {
  id: 'mockTheme',
  cssTemplate: {},
};

const mockThemeResponse: ThemeResponse = {
  theme: mockTheme,
};

describe('Management flow', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('list', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFlowsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFlowsResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<FlowsResponse> = await management.flow.list();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.list, {});

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockFlowsResponse,
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

      const resp: SdkResponse<FlowsResponse> = await management.flow.delete(['flow-1', 'flow-2']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.delete, {
        ids: ['flow-1', 'flow-2'],
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: {},
      });
    });
  });

  describe('export', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFlowResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFlowResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const id = 'flow-id';
      const resp: SdkResponse<FlowResponse> = await management.flow.export(id);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.export, { flowId: id });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockFlowResponse,
      });
    });
  });

  describe('import', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockFlowResponse,
        clone: () => ({
          json: () => Promise.resolve(mockFlowResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const id = 'flow-id';
      const resp: SdkResponse<FlowResponse> = await management.flow.import(id, mockFlow, [
        mockScreen,
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.import, {
        flowId: id,
        screens: [mockScreen],
        flow: mockFlow,
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockFlowResponse,
      });
    });
  });

  describe('run', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRunFlowResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRunFlowResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const id = 'flow-id';
      const resp = await management.flow.run(id);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.run, {
        flowId: id,
        options: undefined,
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockRunFlowResponse.output,
      });
    });

    it('should send the correct request with options and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRunFlowResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRunFlowResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const id = 'flow-id';
      const options = { input: { userId: '123' }, preview: true, tenant: 'tenant-1' };
      const resp = await management.flow.run(id, options);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.run, { flowId: id, options });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockRunFlowResponse.output,
      });
    });
  });
});

describe('Management theme', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('export', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockThemeResponse,
        clone: () => ({
          json: () => Promise.resolve(mockThemeResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ThemeResponse> = await management.theme.export();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.theme.export, {});

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockThemeResponse,
      });
    });
  });

  describe('import', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockThemeResponse,
        clone: () => ({
          json: () => Promise.resolve(mockThemeResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<ThemeResponse> = await management.theme.import(mockTheme);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.theme.import, { theme: mockTheme });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockThemeResponse,
      });
    });
  });
});
