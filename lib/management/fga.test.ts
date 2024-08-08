import WithFGA from './fga';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';

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
        apiPaths.authz.reCreate,
        { tuples: relations },
        { token: undefined },
      );
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
});
