import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { Permission } from './types';

const management = withManagement(mockHttpClient);

const mockPermissions = [
  { name: 'name', description: 'description', systemDefault: true },
  { name: 'name2', description: 'description2', systemDefault: false },
  { name: 'name3', description: 'description3', systemDefault: false },
];

const mockAllPermissionsResponse = {
  permissions: mockPermissions,
};

describe('Management Permission', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.create, {
        name: 'name',
        description: 'description',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createBatch', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.createBatch(mockPermissions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.createBatch, {
        permissions: mockPermissions,
      });

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.update, {
        name: 'name',
        newName: 'newName',
        description: 'description',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateWithId', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.updateWithId('id', 'newName', 'description');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.update, {
        id: 'id',
        newName: 'newName',
        description: 'description',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateBatch', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const permissions = [
        { id: 'id1', newName: 'newName1', description: 'description1' },
        { id: 'id2', newName: 'newName2' },
      ];
      const resp = await management.permission.updateBatch(permissions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.updateBatch, {
        permissions,
      });

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

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.delete, {
        name: 'name',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteWithId', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.deleteWithId('id');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.delete, {
        id: 'id',
      });

      expect(resp).toEqual({
        code: 200,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteBatch', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        clone: () => ({
          json: () => Promise.resolve(),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.permission.deleteBatch(['name1', 'name2'], ['id1']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.permission.deleteBatch, {
        names: ['name1', 'name2'],
        ids: ['id1'],
      });

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

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.permission.loadAll, {});

      expect(resp).toEqual({
        code: 200,
        data: mockPermissions,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
