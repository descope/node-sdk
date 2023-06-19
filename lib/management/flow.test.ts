import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import {
  FlowResponse,
  FlowsResponse,
  Flow,
  Screen,
  Theme,
  ThemeResponse,
  FlowMetaData,
} from './types';

const management = withManagement(mockCoreSdk, 'key');

const mockFlow: Flow = {
  dsl: {},
  id: 'test',
  name: 'mockFlow',
  disabled: false,
};

const mockFlowMetaData: FlowMetaData = {
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
  flows: [mockFlowMetaData],
  total: 1,
};

const mockFlowResponse: FlowResponse = {
  flow: mockFlow,
  screens: [mockScreen],
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
    mockHttpClient.reset();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.flow.list, {}, { token: 'key' });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockFlowsResponse,
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.flow.export,
        { flowId: id },
        { token: 'key' },
      );

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.flow.import,
        { flowId: id, screens: [mockScreen], flow: mockFlow },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockFlowResponse,
      });
    });
  });
});

describe('Management theme', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.theme.export, {}, { token: 'key' });

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.theme.import,
        { theme: mockTheme },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
        data: mockThemeResponse,
      });
    });
  });
});
