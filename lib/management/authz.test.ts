import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import {
  AuthzSchema,
  AuthzRelation,
  AuthzRelationQuery,
  AuthzModified,
  AuthzResource,
} from './types';

jest.mock('../fetch-polyfill', () => jest.fn());

const management = withManagement(mockHttpClient);

const mockLoadSchema = {
  name: 'mock',
  namespaces: [{ name: 'doc', relationDefinitions: [{ name: 'owner' }] }],
};

const mockLoadSchemaResponse = {
  schema: mockLoadSchema,
};

const mockRelation = {
  resource: 'roadmap.ppt',
  relationDefinition: 'owner',
  namespace: 'doc',
  target: 'u1',
};

const mockRelationResponse = {
  relations: [mockRelation],
};

const mockResourcesResponse = {
  resources: ['roadmap.ppt'],
};

const mockRelationQuery = {
  resource: 'roadmap.ppt',
  relationDefinition: 'owner',
  namespace: 'doc',
  target: 'u1',
  hasRelation: true,
};

const mockRelationsQueryResponse = {
  relationQueries: [mockRelationQuery],
};

const mockModified = {
  resources: ['roadmap.ppt'],
  targets: ['u'],
  schemaChanged: true,
};

describe('Management Authz', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('loadSchema', () => {
    it('should load the schema', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockLoadSchemaResponse,
        clone: () => ({
          json: () => Promise.resolve(mockLoadSchemaResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzSchema> = await management.authz.loadSchema();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.schemaLoad, {});
      expect(resp).toEqual({
        code: 200,
        data: mockLoadSchema,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('saveSchema', () => {
    it('should save the schema', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.saveSchema(mockLoadSchema, true);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.schemaSave, {
        schema: mockLoadSchema,
        upgrade: true,
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteSchema', () => {
    it('should delete the schema', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteSchema();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.schemaDelete, {});
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('saveNamespace', () => {
    it('should save the namespace', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.saveNamespace(
        mockLoadSchema.namespaces[0],
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.nsSave, {
        namespace: mockLoadSchema.namespaces[0],
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteNamespace', () => {
    it('should delete the namespace', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteNamespace('doc');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.nsDelete, {
        name: 'doc',
        schemaName: undefined,
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('saveRelationDefinition', () => {
    it('should save the relation definition', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.saveRelationDefinition(
        mockLoadSchema.namespaces[0].relationDefinitions[0],
        'owner',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.rdSave, {
        relationDefinition: mockLoadSchema.namespaces[0].relationDefinitions[0],
        namespace: 'owner',
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteRelationDefinition', () => {
    it('should delete the relation definition', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteRelationDefinition(
        'owner',
        'doc',
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.rdDelete, {
        name: 'owner',
        namespace: 'doc',
        schemaName: undefined,
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createRelations', () => {
    it('should create relations', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.createRelations([mockRelation]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.reCreate, {
        relations: [mockRelation],
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteRelationsForResources', () => {
    it('should delete the relations for given resource', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteRelationsForResources(['x']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.reDeleteResources, {
        resources: ['x'],
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteResourceRelationsForResources', () => {
    it('should delete the relations for given resource', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteResourceRelationsForResources([
        'x',
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.reDeleteResourceRelationsForResources,
        { resources: ['x'] },
      );
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteRelationsForIDs', () => {
    it('should delete the relations for the given ids using the reDeleteResources API', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteRelationsForIds(['x']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.reDeleteResources, {
        resources: ['x'],
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('deleteRelations', () => {
    it('should delete the relations', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<never> = await management.authz.deleteRelations([mockRelation]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.reDelete, {
        relations: [mockRelation],
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('hasRelations', () => {
    it('should query the given relations', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRelationsQueryResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRelationsQueryResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzRelationQuery[]> = await management.authz.hasRelations([
        mockRelationQuery,
      ]);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.hasRelations,
        mockRelationsQueryResponse,
      );
      expect(resp).toEqual({
        code: 200,
        data: [mockRelationQuery],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('whoCanAccess', () => {
    const targets = { targets: ['u1'] };
    it('should query who can access the given resource using given rd', async () => {
      const httpResponse = {
        ok: true,
        json: () => targets,
        clone: () => ({
          json: () => Promise.resolve(targets),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<string[]> = await management.authz.whoCanAccess('r', 'owner', 'doc');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.who, {
        resource: 'r',
        relationDefinition: 'owner',
        namespace: 'doc',
      });
      expect(resp).toEqual({
        code: 200,
        data: ['u1'],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('resourceRelations', () => {
    it('should load the relations for the given resource', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRelationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRelationResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzRelation[]> = await management.authz.resourceRelations(
        'r',
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.resource, {
        resource: 'r',
        ignoreTargetSetRelations: true,
      });
      expect(resp).toEqual({
        code: 200,
        data: [mockRelation],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('targetsRelations', () => {
    it('should load the relations for the given targets', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRelationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRelationResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzRelation[]> = await management.authz.targetsRelations(
        ['t'],
        true,
      );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.targets, {
        targets: ['t'],
        includeTargetSetRelations: true,
      });
      expect(resp).toEqual({
        code: 200,
        data: [mockRelation],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('whatCanTargetAccess', () => {
    it('should load the relations for the given target including recursive', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockRelationResponse,
        clone: () => ({
          json: () => Promise.resolve(mockRelationResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzRelation[]> = await management.authz.whatCanTargetAccess('t');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.targetAll, { target: 't' });
      expect(resp).toEqual({
        code: 200,
        data: [mockRelation],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('whatCanTargetAccessWithRelation', () => {
    it('should load the relations for the given target with specific relation definition and namespace', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockResourcesResponse,
        clone: () => ({
          json: () => Promise.resolve(mockResourcesResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzResource[]> =
        await management.authz.whatCanTargetAccessWithRelation(
          mockRelation.target,
          mockRelation.relationDefinition,
          mockRelation.namespace,
        );

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.targetWithRelation, {
        target: mockRelation.target,
        relationDefinition: mockRelation.relationDefinition,
        namespace: mockRelation.namespace,
      });
      expect(resp).toEqual({
        code: 200,
        data: [{ resource: 'roadmap.ppt' }],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('getModified', () => {
    it('should load the resources and targets changes', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockModified,
        clone: () => ({
          json: () => Promise.resolve(mockModified),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuthzModified> = await management.authz.getModified(undefined);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.getModified, { since: 0 });
      expect(resp).toEqual({
        code: 200,
        data: mockModified,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('Authz Cache URL support', () => {
    let fetchMock: jest.Mock;

    const fgaCacheUrl = 'https://my-fga-cache.example.com';
    const projectId = 'test-project-id';
    const managementKey = 'test-management-key';
    const headers = {
      'x-descope-sdk-name': 'nodejs',
      'x-descope-sdk-node-version': '18.0.0',
      'x-descope-sdk-version': '1.0.0',
    };

    const fgaConfig = {
      fgaCacheUrl,
      managementKey,
      projectId,
      headers,
    };

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      fetchMock = require('../fetch-polyfill') as jest.Mock;
    });

    it('should use cache URL for whoCanAccess when configured', async () => {
      const targets = { targets: ['u1'] };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => targets,
        clone: () => ({ json: async () => targets }),
        status: 200,
      });

      const managementWithCache = withManagement(mockHttpClient, fgaConfig);
      const resp = await managementWithCache.authz.whoCanAccess('r', 'owner', 'doc');

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.authz.who}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify({ resource: 'r', relationDefinition: 'owner', namespace: 'doc' }),
        }),
      );
      expect(resp.data).toEqual(['u1']);
    });

    it('should use cache URL for whatCanTargetAccess when configured', async () => {
      const relationsResponse = { relations: [mockRelation] };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => relationsResponse,
        clone: () => ({ json: async () => relationsResponse }),
        status: 200,
      });

      const managementWithCache = withManagement(mockHttpClient, fgaConfig);
      const resp = await managementWithCache.authz.whatCanTargetAccess('t');

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.authz.targetAll}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify({ target: 't' }),
        }),
      );
      expect(resp.data).toEqual([mockRelation]);
    });

    it('should use default httpClient when cache URL is not configured', async () => {
      const targets = { targets: ['u1'] };
      const httpResponse = {
        ok: true,
        json: () => targets,
        clone: () => ({
          json: () => Promise.resolve(targets),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.authz.whoCanAccess('r', 'owner', 'doc');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.who, {
        resource: 'r',
        relationDefinition: 'owner',
        namespace: 'doc',
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fallback to httpClient when cache URL fetch fails for whoCanAccess', async () => {
      const targets = { targets: ['u1'] };
      const httpResponse = {
        ok: true,
        json: () => targets,
        clone: () => ({
          json: () => Promise.resolve(targets),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      fetchMock.mockRejectedValue(new Error('Network error'));

      const managementWithCache = withManagement(mockHttpClient, fgaConfig);
      const resp = await managementWithCache.authz.whoCanAccess('r', 'owner', 'doc');

      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.who, {
        resource: 'r',
        relationDefinition: 'owner',
        namespace: 'doc',
      });
      expect(resp.data).toEqual(['u1']);
    });

    it('should fallback to httpClient when cache URL fetch fails for whatCanTargetAccess', async () => {
      const relationsResponse = { relations: [mockRelation] };
      const httpResponse = {
        ok: true,
        json: () => relationsResponse,
        clone: () => ({
          json: () => Promise.resolve(relationsResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      fetchMock.mockRejectedValue(new Error('Network error'));

      const managementWithCache = withManagement(mockHttpClient, fgaConfig);
      const resp = await managementWithCache.authz.whatCanTargetAccess('t');

      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.targetAll, {
        target: 't',
      });
      expect(resp.data).toEqual([mockRelation]);
    });
  });
});
