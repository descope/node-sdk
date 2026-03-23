import WithFGA from './fga';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { FGAResourceIdentifier, FGAResourceDetails } from './types';

jest.mock('../fetch-polyfill', () => jest.fn());

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
  let fetchMock: jest.Mock;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    fetchMock = require('../fetch-polyfill') as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });
  describe('saveSchema', () => {
    it('should save the schema', async () => {
      const schema = { dsl: 'schema' };
      const response = await WithFGA(mockHttpClient).saveSchema(schema);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.schema, schema);
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteSchema', () => {
    it('should delete the schema', async () => {
      const response = await WithFGA(mockHttpClient).deleteSchema();
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.authz.schemaDelete, {});
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('createRelations', () => {
    it('should create the relations', async () => {
      const relations = [relation1];
      const response = await WithFGA(mockHttpClient).createRelations(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.relations, {
        tuples: relations,
      });
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteRelations', () => {
    it('should delete the relations', async () => {
      const relations = [relation1];
      const response = await WithFGA(mockHttpClient).deleteRelations(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.deleteRelations, {
        tuples: relations,
      });
      expect(response).toEqual(emptySuccessResponse);
    });
  });

  describe('deleteAllRelations', () => {
    it('should delete all relations', async () => {
      const response = await WithFGA(mockHttpClient).deleteAllRelations();
      expect(mockHttpClient.delete).toHaveBeenCalledWith(apiPaths.fga.relations);
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
      const response = await WithFGA(mockHttpClient).check(relations);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.check, { tuples: relations });
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
      const response = await WithFGA(mockHttpClient).loadResourcesDetails(ids);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.resourcesLoad, {
        resourceIdentifiers: ids,
      });
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
      await expect(WithFGA(mockHttpClient).loadResourcesDetails(ids)).rejects.toThrow();
    });
  });

  describe('saveResourcesDetails', () => {
    it('should save resource details on success', async () => {
      const details: FGAResourceDetails[] = [
        { resourceId: 'r1', resourceType: 'type1', displayName: 'Name1' },
      ];
      const response = await WithFGA(mockHttpClient).saveResourcesDetails(details);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.resourcesSave, {
        resourcesDetails: details,
      });
      expect(response).toEqual(emptySuccessResponse);
    });

    it('should throw an error on failure', async () => {
      const details = [{ resourceId: 'r1', resourceType: 'type1', displayName: 'Name1' }];
      const httpResponse = { ok: false, status: 400 };
      mockHttpClient.post.mockResolvedValue(httpResponse);
      await expect(WithFGA(mockHttpClient).saveResourcesDetails(details)).rejects.toThrow();
    });
  });

  describe('FGA Cache URL support', () => {
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

    it('should use cache URL for saveSchema when configured', async () => {
      const schema = { dsl: 'model AuthZ 1.0' };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
        json: async () => ({}),
        clone: () => ({ json: async () => ({}) }),
        status: 200,
      });

      await WithFGA(mockHttpClient, fgaConfig).saveSchema(schema);

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.fga.schema}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify(schema),
        }),
      );
    });

    it('should use cache URL for createRelations when configured', async () => {
      const relations = [relation1];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
        json: async () => ({}),
        clone: () => ({ json: async () => ({}) }),
        status: 200,
      });

      await WithFGA(mockHttpClient, fgaConfig).createRelations(relations);

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.fga.relations}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify({ tuples: relations }),
        }),
      );
    });

    it('should use cache URL for deleteRelations when configured', async () => {
      const relations = [relation1];
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
        json: async () => ({}),
        clone: () => ({ json: async () => ({}) }),
        status: 200,
      });

      await WithFGA(mockHttpClient, fgaConfig).deleteRelations(relations);

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.fga.deleteRelations}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify({ tuples: relations }),
        }),
      );
    });

    it('should use cache URL for check when configured', async () => {
      const relations = [relation1, relation2];
      const checkBody = { tuples: mockCheckResponseRelations };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(checkBody),
        json: async () => checkBody,
        clone: () => ({ json: async () => checkBody }),
        status: 200,
        headers: new Map(),
      });

      const result = await WithFGA(mockHttpClient, fgaConfig).check(relations);

      expect(fetchMock).toHaveBeenCalledWith(
        `${fgaCacheUrl}${apiPaths.fga.check}`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${projectId}:${managementKey}`,
            'x-descope-project-id': projectId,
          }),
          body: JSON.stringify({ tuples: relations }),
        }),
      );
      expect(result.data).toEqual(mockCheckResponseRelations);
    });

    it('should use default httpClient when cache URL is not configured', async () => {
      const schema = { dsl: 'model AuthZ 1.0' };
      await WithFGA(mockHttpClient).saveSchema(schema);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.schema, schema);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should fallback to httpClient when cache URL fetch fails', async () => {
      const schema = { dsl: 'model AuthZ 1.0' };
      fetchMock.mockRejectedValue(new Error('Network error'));

      await WithFGA(mockHttpClient, fgaConfig).saveSchema(schema);

      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.schema, schema);
    });

    it('should use custom fgaCacheTimeoutMs when provided', async () => {
      const customConfig = { ...fgaConfig, fgaCacheTimeoutMs: 60000 };
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({}),
        json: async () => ({}),
        clone: () => ({ json: async () => ({}) }),
        status: 200,
      });

      await WithFGA(mockHttpClient, customConfig).saveSchema({ dsl: 'test' });

      // Verify cache URL was called (timeout didn't fire immediately)
      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it.each([0, -1, NaN, Infinity])(
      'should fall back to default timeout for invalid fgaCacheTimeoutMs=%s',
      async (invalidValue) => {
        fetchMock.mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify({}),
          json: async () => ({}),
          clone: () => ({ json: async () => ({}) }),
          status: 200,
        });

        const invalidConfig = { ...fgaConfig, fgaCacheTimeoutMs: invalidValue };
        await WithFGA(mockHttpClient, invalidConfig).saveSchema({ dsl: 'test' });

        // Should still call the cache URL (not crash or abort immediately)
        expect(fetchMock).toHaveBeenCalled();
      },
    );

    it('should return correct data for a large check response (1206 tuples) via cache path', async () => {
      const largeTuples = Array.from({ length: 1206 }, (_, i) => ({
        resource: `u${i}`,
        resourceType: 'user',
        relation: 'member',
        target: `g${i}`,
        targetType: 'group',
        allowed: i % 2 === 0,
      }));
      const responseBody = { tuples: largeTuples };
      const bodyText = JSON.stringify(responseBody);
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => bodyText,
        json: async () => responseBody,
        clone: () => ({ json: async () => responseBody }),
        status: 200,
      });

      const result = await WithFGA(mockHttpClient, fgaConfig).check(
        largeTuples.map(({ resource, resourceType, relation, target, targetType }) => ({
          resource,
          resourceType,
          relation,
          target,
          targetType,
        })),
      );

      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).not.toHaveBeenCalled();
      expect(result.data).toHaveLength(1206);
      expect(result.data![0]).toEqual(largeTuples[0]);
      expect(result.data![1205]).toEqual(largeTuples[1205]);
    });

    it('should handle 1000+ concurrent check calls via cache path', async () => {
      const singleTuple = [relation1];
      const responseBody = { tuples: [{ ...relation1, allowed: true }] };
      const bodyText = JSON.stringify(responseBody);
      fetchMock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          text: async () => bodyText,
          json: async () => responseBody,
          clone: () => ({ json: async () => responseBody }),
          status: 200,
        }),
      );

      const calls = Array.from({ length: 1000 }, () =>
        WithFGA(mockHttpClient, fgaConfig).check(singleTuple),
      );
      const results = await Promise.all(calls);

      expect(fetchMock).toHaveBeenCalledTimes(1000);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
      results.forEach((result) => {
        expect(result.ok).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0].allowed).toBe(true);
      });
    });

    // Regression test for the node-fetch clone hang this fix addresses.
    // Without the body pre-consumption fix, transformResponse calls clone().json() on the
    // raw node-fetch Response. When the body stream is already consumed, node-fetch's
    // clone().json() returns a Promise that never resolves — causing check() to hang
    // indefinitely with no timeout protection (the AbortController is already cleared).
    // With the fix, .clone() is overridden in postWithOptionalCache before transformResponse
    // sees it, so it always resolves immediately. The 100ms timeout is intentionally tight:
    // with the fix the call completes in <5ms; without it, it hangs indefinitely.
    it('should not hang when cache response .clone().json() never resolves (simulates node-fetch hang on consumed stream)', async () => {
      const responseBody = { tuples: [{ ...relation1, allowed: true }] };
      const bodyText = JSON.stringify(responseBody);
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => bodyText,
        json: async () => responseBody,
        // Simulate node-fetch: clone().json() on a consumed body stream hangs forever
        clone: () => ({ json: () => new Promise(() => {}) }),
        status: 200,
      });

      // Without fix: hangs indefinitely (clone().json() never settles)
      // With fix: .clone() is overridden → resolves immediately from memoized body
      const result = await WithFGA(mockHttpClient, fgaConfig).check([relation1]);
      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
    }, 100);

    it('should not crash when cache response .clone() would throw (body pre-consumed)', async () => {
      const responseBody = { tuples: [{ ...relation1, allowed: true }] };
      const bodyText = JSON.stringify(responseBody);
      // Simulate a raw node-fetch response where .clone() would throw
      fetchMock.mockResolvedValue({
        ok: true,
        text: async () => bodyText,
        json: async () => responseBody,
        clone: () => {
          throw new Error('clone failed — body already consumed');
        },
        status: 200,
      });

      // After the fix, .clone() is overridden before transformResponse sees it
      const result = await WithFGA(mockHttpClient, fgaConfig).check([relation1]);

      expect(fetchMock).toHaveBeenCalled();
      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should fall back to httpClient when cache returns non-OK status', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 503 });

      const schema = { dsl: 'test' };
      await WithFGA(mockHttpClient, fgaConfig).saveSchema(schema);

      expect(fetchMock).toHaveBeenCalled();
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.fga.schema, schema);
    });
  });
});
