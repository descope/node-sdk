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
      const mockCreateProjectResponse = {
        projectId: 'id1',
        projectName: 'name1',
      };

      const httpResponse = {
        ok: true,
        json: () => mockCreateProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockCreateProjectResponse),
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
        data: mockCreateProjectResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
