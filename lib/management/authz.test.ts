import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { AuthzSchema, AuthzRelation, AuthzRelationQuery } from './types';

const management = withManagement(mockCoreSdk, 'key');

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

describe('Management Authz', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.schemaLoad,
        {},
        { token: 'key' },
      );
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.schemaSave,
        { schema: mockLoadSchema, upgrade: true },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.schemaDelete,
        {},
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.nsSave,
        { namespace: mockLoadSchema.namespaces[0] },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.nsDelete,
        { name: 'doc', schemaName: undefined },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.rdSave,
        {
          relationDefinition: mockLoadSchema.namespaces[0].relationDefinitions[0],
          namespace: 'owner',
        },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.rdDelete,
        { name: 'owner', namespace: 'doc', schemaName: undefined },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.reCreate,
        {
          relations: [mockRelation],
        },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.reDeleteResources,
        { resources: ['x'] },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.reDelete,
        { relations: [mockRelation] },
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
        { token: 'key' },
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.who,
        { resource: 'r', relationDefinition: 'owner', namespace: 'doc' },
        { token: 'key' },
      );
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

      const resp: SdkResponse<AuthzRelation[]> = await management.authz.resourceRelations('r');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.resource,
        { resource: 'r' },
        { token: 'key' },
      );
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

      const resp: SdkResponse<AuthzRelation[]> = await management.authz.targetsRelations(['t']);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.targets,
        { targets: ['t'] },
        { token: 'key' },
      );
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.targetAll,
        { target: 't' },
        { token: 'key' },
      );
      expect(resp).toEqual({
        code: 200,
        data: [mockRelation],
        ok: true,
        response: httpResponse,
      });
    });
  });
});
