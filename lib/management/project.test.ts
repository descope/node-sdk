import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';

const management = withManagement(mockCoreSdk, 'key');

describe('Management Project', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('updateName', () => {
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

      const name = 'new project name';
      const resp = await management.project.updateName(name);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.project.updateName,
        { name },
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

  describe('clone', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockCloneProjectResponse = {
        projectId: 'id1',
        projectName: 'name1',
      };

      const httpResponse = {
        ok: true,
        json: () => mockCloneProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockCloneProjectResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const name = 'name1';
      const tag = 'production';
      const resp = await management.project.clone('name1', tag);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.project.clone,
        { name, tag },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockCloneProjectResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('export', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockExportProjectResponse = {
        files: {
          'foo/bar.json': {
            foo: 'bar',
          },
        },
      };

      const httpResponse = {
        ok: true,
        json: () => mockExportProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockExportProjectResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.project.export();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.project.export,
        {},
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        data: mockExportProjectResponse.files,
        ok: true,
        response: httpResponse,
      });
    });
  });
});

describe('import', () => {
  it('should send the correct request and receive correct response', async () => {
    const mockImportProjectResponse = {};

    const httpResponse = {
      ok: true,
      json: () => mockImportProjectResponse,
      clone: () => ({
        json: () => Promise.resolve(mockImportProjectResponse),
      }),
      status: 200,
    };
    mockHttpClient.post.mockResolvedValue(httpResponse);

    const resp = await management.project.import({ 'foo/bar.json': { foo: 'bar' } });

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      apiPaths.project.import,
      {
        files: {
          'foo/bar.json': {
            foo: 'bar',
          },
        },
      },
      { token: 'key' },
    );

    expect(resp).toEqual({
      code: 200,
      data: mockImportProjectResponse,
      ok: true,
      response: httpResponse,
    });
  });
});
