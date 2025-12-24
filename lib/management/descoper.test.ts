import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { Descoper, DescoperCreate, DescoperRole } from './types';

const management = withManagement(mockHttpClient);

const mockDescoper: Descoper = {
  id: 'U2111111111111111111111111',
  loginIds: ['user1@example.com'],
  attributes: {
    displayName: 'Test User',
    email: 'user1@example.com',
    phone: '+123456',
  },
  rbac: {
    isCompanyAdmin: false,
    tags: [],
    projects: [
      {
        projectIds: ['P2111111111111111111111111'],
        role: 'admin',
      },
    ],
  },
  status: 'invited',
};

const mockDescoperResponse = {
  descoper: mockDescoper,
};

const mockDescopersResponse = {
  descopers: [mockDescoper],
  total: 1,
};

describe('Management Descoper', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('create', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockDescopersResponse,
        clone: () => ({
          json: () => Promise.resolve(mockDescopersResponse),
        }),
        status: 200,
      };
      mockHttpClient.put.mockResolvedValue(httpResponse);

      const descopers: DescoperCreate[] = [
        {
          loginId: 'user1@example.com',
          attributes: {
            displayName: 'Test User',
            email: 'user1@example.com',
            phone: '+123456',
          },
          rbac: {
            projects: [
              {
                projectIds: ['P2111111111111111111111111'],
                role: 'admin' as DescoperRole,
              },
            ],
          },
        },
      ];

      const resp: SdkResponse<{ descopers: Descoper[]; total: number }> =
        await management.descoper.create(descopers);

      expect(mockHttpClient.put).toHaveBeenCalledWith(apiPaths.descoper.create, {
        descopers,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockDescopersResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('load', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockDescoperResponse,
        clone: () => ({
          json: () => Promise.resolve(mockDescoperResponse),
        }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Descoper> = await management.descoper.load(
        'U2111111111111111111111111',
      );

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.descoper.get, {
        queryParams: { id: 'U2111111111111111111111111' },
      });

      expect(resp).toEqual({
        code: 200,
        data: mockDescoper,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('update', () => {
    it('should send the correct request and receive correct response', async () => {
      const updatedDescoper = {
        ...mockDescoper,
        attributes: {
          displayName: 'Updated User',
        },
        rbac: {
          isCompanyAdmin: true,
          tags: [],
          projects: [],
        },
      };
      const mockUpdateResponse = {
        descoper: updatedDescoper,
      };

      const httpResponse = {
        ok: true,
        json: () => mockUpdateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockUpdateResponse),
        }),
        status: 200,
      };
      mockHttpClient.patch.mockResolvedValue(httpResponse);

      const id = 'U2111111111111111111111111';
      const attributes = { displayName: 'Updated User' };
      const rbac = { isCompanyAdmin: true };

      const resp: SdkResponse<Descoper> = await management.descoper.update(id, attributes, rbac);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(apiPaths.descoper.update, {
        id,
        attributes,
        rbac,
      });

      expect(resp).toEqual({
        code: 200,
        data: updatedDescoper,
        ok: true,
        response: httpResponse,
      });
    });

    it('should omit attributes if omitted', async () => {
      const updatedDescoper = {
        ...mockDescoper,
        attributes: {
          displayName: 'Updated User',
        },
        rbac: {
          isCompanyAdmin: true,
          tags: [],
          projects: [],
        },
      };
      const mockUpdateResponse = {
        descoper: updatedDescoper,
      };

      const httpResponse = {
        ok: true,
        json: () => mockUpdateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockUpdateResponse),
        }),
        status: 200,
      };
      mockHttpClient.patch.mockResolvedValue(httpResponse);

      const id = 'U2111111111111111111111111';
      const attributes = undefined;
      const rbac = { isCompanyAdmin: true };

      const resp: SdkResponse<Descoper> = await management.descoper.update(id, attributes, rbac);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(apiPaths.descoper.update, {
        id,
        attributes,
        rbac,
      });

      expect(resp).toEqual({
        code: 200,
        data: updatedDescoper,
        ok: true,
        response: httpResponse,
      });
    });

    it('should omit RBAC if omitted', async () => {
      const updatedDescoper = {
        ...mockDescoper,
        attributes: {
          displayName: 'Updated User',
        },
        rbac: {
          isCompanyAdmin: true,
          tags: [],
          projects: [],
        },
      };
      const mockUpdateResponse = {
        descoper: updatedDescoper,
      };

      const httpResponse = {
        ok: true,
        json: () => mockUpdateResponse,
        clone: () => ({
          json: () => Promise.resolve(mockUpdateResponse),
        }),
        status: 200,
      };
      mockHttpClient.patch.mockResolvedValue(httpResponse);

      const id = 'U2111111111111111111111111';
      const attributes = { displayName: 'Updated User' };
      const rbac = undefined;

      const resp: SdkResponse<Descoper> = await management.descoper.update(id, attributes, rbac);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(apiPaths.descoper.update, {
        id,
        attributes,
        rbac,
      });

      expect(resp).toEqual({
        code: 200,
        data: updatedDescoper,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('delete', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.delete.mockResolvedValue(httpResponse);

      const resp = await management.descoper.delete('U2111111111111111111111111');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(apiPaths.descoper.delete, {
        queryParams: { id: 'U2111111111111111111111111' },
      });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadAll', () => {
    it('should send the correct request without options and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockDescopersResponse,
        clone: () => ({
          json: () => Promise.resolve(mockDescopersResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<{ descopers: Descoper[]; total: number }> =
        await management.descoper.loadAll();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.descoper.list, {
        options: undefined,
      });

      expect(resp).toEqual({
        code: 200,
        data: { descopers: mockDescopersResponse.descopers, total: mockDescopersResponse.total },
        ok: true,
        response: httpResponse,
      });
    });

    it('should send the correct request with options and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockDescopersResponse,
        clone: () => ({
          json: () => Promise.resolve(mockDescopersResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const options = {};
      const resp: SdkResponse<{ descopers: Descoper[]; total: number }> =
        await management.descoper.loadAll(options);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.descoper.list, {
        options,
      });

      expect(resp).toEqual({
        code: 200,
        data: { descopers: mockDescopersResponse.descopers, total: mockDescopersResponse.total },
        ok: true,
        response: httpResponse,
      });
    });
  });
});
