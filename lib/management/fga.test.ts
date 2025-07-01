import WithFGA from './fga';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { FGAResourceIdentifier, FGAResourceDetails } from './types';

const emptySuccessResponse = {
  code: 200,
  data: { body: 'body' },
  ok: true,
  response: {
    clone: expect.any(Function),
    json: expect.any(Function),
    ok: true,
    status: 200,
  },
};

const relation1 = {
  resource: 'u1',
  resourceType: 'user',
  relation: 'member',
  target: 'g1',
  targetType: 'group',
};

const relation2 = {
  resource: 'u2',
  resourceType: 'user',
  relation: 'member',
  target: 'g2',
  targetType: 'group',
};

const mockCheckResponseRelations = [
  { ...relation1, allowed: true },
  { ...relation2, allowed: false },
];

const mockCheckResponse = {
  tuples: mockCheckResponseRelations,
};

describe('Management FGA', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
  });
  describe('saveSchema', () => {
    it('should save the schema', async () => {
      const schema = { dsl: 'schema' };
      const response = await WithFGA(mockCoreSdk).saveSchema(schema);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.schema, schema, {
        token: undefined,
      });
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteSchema', () => {
    it('should delete the schema', async () => {
      const response = await WithFGA(mockCoreSdk).deleteSchema();
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.authz.schemaDelete,
        {},
        { token: undefined },
      );
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('createRelations', () => {
    it('should create the relations', async () => {
      const relations = [relation1];
      const response = await WithFGA(mockCoreSdk).createRelations(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.fga.relations,
        { tuples: relations },
        { token: undefined },
      );
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteRelations', () => {
    it('should delete the relations', async () => {
      const relations = [relation1];
      const response = await WithFGA(mockCoreSdk).deleteRelations(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.fga.deleteRelations,
        { tuples: relations },
        { token: undefined },
      );
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteAllRelations', () => {
    it('should delete all relations', async () => {
      const response = await WithFGA(mockCoreSdk).deleteAllRelations();
      expect(mockHttpClient.delete).toHaveBeenCalledWith(apiPaths.fga.relations, {
        token: undefined,
      });
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('check', () => {
    it('should check the relations', async () => {
      const relations = [relation1, relation2];
      const httpResponse = {
        ok: true,
        json: () => mockCheckResponse,
        clone: () => ({
          json: () => Promise.resolve(mockCheckResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      const response = await WithFGA(mockCoreSdk).check(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.fga.check,
        { tuples: relations },
        { token: undefined },
      );
      expect(response).toEqual({
        code: 200,
        data: mockCheckResponseRelations,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('loadResourcesDetails', () => {
    it('should load resource details on success', async () => {
      const ids: FGAResourceIdentifier[] = [{ resourceId: 'r1', resourceType: 'type1' }];
      const mockDetails: FGAResourceDetails[] = [
        { resourceId: 'r1', resourceType: 'type1', displayName: 'Name1' },
      ];
      const httpResponse = {
        ok: true,
        json: () => ({ resourcesDetails: mockDetails }),
        clone: () => ({ json: () => Promise.resolve({ resourcesDetails: mockDetails }) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      const response = await WithFGA(mockCoreSdk).loadResourcesDetails(ids);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.fga.resourcesLoad,
        { resourceIdentifiers: ids },
        { token: undefined },
      );
      expect(response).toEqual({
        code: 200,
        data: mockDetails,
        ok: true,
        response: httpResponse,
      });
    });

    it('should throw an error on failure', async () => {
      const ids: FGAResourceIdentifier[] = [{ resourceId: 'r1', resourceType: 'type1' }];
      const httpResponse = { ok: false, status: 400 };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      await expect(WithFGA(mockCoreSdk).loadResourcesDetails(ids)).rejects.toThrow();
    });
  });

  describe('saveResourcesDetails', () => {
    it('should save resource details on success', async () => {
      const details: FGAResourceDetails[] = [
        { resourceId: 'r1', resourceType: 'type1', displayName: 'Name1' },
      ];
      const response = await WithFGA(mockCoreSdk).saveResourcesDetails(details);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.fga.resourcesSave,
        { resourcesDetails: details },
        { token: undefined },
      );
      expect(response).toEqual(emptySuccessResponse);
    });

    it('should throw an error on failure', async () => {
      const details = [{ resourceId: 'r1', resourceType: 'type1', displayName: 'Name1' }];
      const httpResponse = { ok: false, status: 400 };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      await expect(WithFGA(mockCoreSdk).saveResourcesDetails(details)).rejects.toThrow();
    });
  });
});
