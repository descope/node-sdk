import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { Permission } from './types';

const management = withManagement(mockCoreSdk, 'key');

const mockPermissions = [
  { name: 'name', description: 'description' },
  { name: 'name2', description: 'description2' },
  { name: 'name3', description: 'description3' },
];

const mockAllPermissionsResponse = {
  permissions: mockPermissions,
};

describe('Management Permission', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.create('name', 'description');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.permission.create,
        { name: 'name', description: 'description' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.update('name', 'newName', 'description');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.permission.update,
        { name: 'name', newName: 'newName', description: 'description' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('delete', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.delete('name');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.permission.delete,
        { name: 'name' },
        { token: 'key' },
      );

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAll', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllPermissionsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllPermissionsResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Permission[]> = await management.permission.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.permission.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockPermissions,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
