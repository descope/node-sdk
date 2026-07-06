import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { Role, RoleSearchOptions } from './types';

const management = withManagement(mockHttpClient);

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
    tenantId: 't1',
  },
];

const mockAllRolesResponse = {
  roles: mockRoles,
};

describe('Management Role', () => {
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

      const resp = await management.role.create('name', 'description', ['p1', 'p2'], 't1', true);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.create, {
        name: 'name',
        description: 'description',
        permissionNames: ['p1', 'p2'],
        tenantId: 't1',
        default: true,
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
        json: () => mockAllRolesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllRolesResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Role[]> = await management.role.createBatch(mockRoles);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.createBatch, {
        roles: mockRoles,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockRoles,
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

      const resp = await management.role.update(
        'name',
        'newName',
        'description',
        ['p1', 'p2'],
        't1',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.update, {
        name: 'name',
        tenantId: 't1',
        newName: 'newName',
        description: 'description',
        permissionNames: ['p1', 'p2'],
        default: true,
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

      const resp = await management.role.updateWithId(
        'id',
        'newName',
        'description',
        ['p1', 'p2'],
        't1',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.update, {
        id: 'id',
        tenantId: 't1',
        newName: 'newName',
        description: 'description',
        permissionNames: ['p1', 'p2'],
        default: true,
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
        json: () => mockAllRolesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllRolesResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const roles = [
        {
          id: 'id1',
          newName: 'newName1',
          description: 'description1',
          permissionNames: ['p1'],
          tenantId: 't1',
          default: true,
        },
      ];
      const resp: SdkResponse<Role[]> = await management.role.updateBatch(roles);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.updateBatch, {
        roles,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockRoles,
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

      const resp = await management.role.delete('name', 't1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.delete, {
        name: 'name',
        tenantId: 't1',
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

      const resp = await management.role.deleteWithId('id', 't1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.delete, {
        id: 'id',
        tenantId: 't1',
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

      const resp = await management.role.deleteBatch(['name1', 'name2'], 't1', ['id1']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.deleteBatch, {
        roleNames: ['name1', 'name2'],
        tenantId: 't1',
        roleIds: ['id1'],
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
        json: () => mockAllRolesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllRolesResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Role[]> = await management.role.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.role.loadAll, {});

      expect(resp).toEqual({
        code: 200,
        data: mockRoles,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('search', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockAllRolesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockAllRolesResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      const req: RoleSearchOptions = {
        tenantIds: ['t'],
        roleNames: ['r'],
        roleNameLike: 'x',
        permissionNames: ['p'],
      };
      const resp: SdkResponse<Role[]> = await management.role.search(req);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.role.search, req, {});

      expect(resp).toEqual({
        code: 200,
        data: mockRoles,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
