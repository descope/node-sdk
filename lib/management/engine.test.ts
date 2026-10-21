import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { Engine, EngineSecretResponse } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

// The management Engine exposes only id/name/secret/createdTime; createdTime is an int32
// epoch-seconds JSON number.
const mockEngine: Engine = {
  id: 'eng1',
  name: 'my-engine',
  secret: 's3cret',
  createdTime: 1719571200,
};

describe('Management Engine', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('create', () => {
    it('should send the correct request and return the engine with its secret', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({ engine: mockEngine }),
        clone: () => ({ json: () => Promise.resolve({ engine: mockEngine }) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Engine> = await management.engine.create('my-engine');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.engine.create, {
        name: 'my-engine',
      });
      expect(resp.data).toEqual(mockEngine);
      expect(resp.data?.secret).toBe('s3cret');
    });
  });

  describe('update', () => {
    it('should send the correct request', async () => {
      const updated = { id: 'eng1', name: 'renamed' };
      const httpResponse = {
        ok: true,
        json: () => ({ engine: updated }),
        clone: () => ({ json: () => Promise.resolve({ engine: updated }) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.engine.update('eng1', 'renamed');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.engine.update, {
        id: 'eng1',
        name: 'renamed',
      });
      expect(resp.data).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should send the correct request', async () => {
      const httpResponse = {
        ok: true,
        json: () => ({}),
        clone: () => ({ json: () => Promise.resolve({}) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      await management.engine.delete('eng1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.engine.delete, {
        id: 'eng1',
      });
    });
  });

  describe('load', () => {
    it('should send the correct request with the id query param', async () => {
      const loaded = { id: 'eng1', name: 'my-engine' };
      const httpResponse = {
        ok: true,
        json: () => ({ engine: loaded }),
        clone: () => ({ json: () => Promise.resolve({ engine: loaded }) }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp = await management.engine.load('eng1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.engine.load, {
        queryParams: { id: 'eng1' },
      });
      expect(resp.data).toEqual(loaded);
    });
  });

  describe('loadAll', () => {
    it('should send the correct request and return all engines', async () => {
      const engines = [{ id: 'eng1' }, { id: 'eng2' }];
      const httpResponse = {
        ok: true,
        json: () => ({ engines }),
        clone: () => ({ json: () => Promise.resolve({ engines }) }),
        status: 200,
      };
      mockHttpClient.get.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Engine[]> = await management.engine.loadAll();

      expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.engine.loadAll, {});
      expect(resp.data).toEqual(engines);
    });
  });

  describe('rotateSecret', () => {
    it('should send the correct request and return the new secret', async () => {
      const secretResp: EngineSecretResponse = { secret: 'newS3cret' };
      const httpResponse = {
        ok: true,
        json: () => secretResp,
        clone: () => ({ json: () => Promise.resolve(secretResp) }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.engine.rotateSecret('eng1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.engine.rotate, {
        id: 'eng1',
      });
      expect(resp.data?.secret).toBe('newS3cret');
    });
  });
});
