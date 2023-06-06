import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { Role } from './types';

const management = withManagement(mockCoreSdk, 'key');

const mockRoles = [
  {
    name: 'name',
    description: 'description',
    permissionNames: ['p1', 'p2'],
    createdTime: new Date().getTime(),
  },
  {
    name: 'name2',
    description: 'description2',
    permissionNames: ['p1'],
    createdTime: new Date().getTime(),
  },
  {
    name: 'name3',
    description: 'description3',
    permissionNames: [],
    createdTime: new Date().getTime(),
  },
];

const mockAllRolesResponse = {
  roles: mockRoles,
};

describe('Management Role', () => {
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

      const resp = await management.role.create('name', 'description', ['p1', 'p2']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.role.create,
        { name: 'name', description: 'description', permissionNames: ['p1', 'p2'] },
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

      const resp = await management.role.update('name', 'newName', 'description', ['p1', 'p2']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.role.update,
        {
          name: 'name',
          newName: 'newName',
          description: 'description',
          permissionNames: ['p1', 'p2'],
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

      const resp = await management.role.delete('name');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.role.delete,
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
        json: () => mockAllRolesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllRolesResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Role[]> = await management.role.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.role.loadAll, {
        token: 'key',
      });

      expect(resp).toEqual({
        code: 200,
        data: mockRoles,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
