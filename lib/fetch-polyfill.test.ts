// the dist assertion requires to run `npm run build` before running the test

import { readFileSync } from 'fs';
import polyfillFetch from './fetch-polyfill';

describe('fetch-polyfill', () => {
  it('should delegate to the runtime native fetch', async () => {
    const res = { ok: true };
    const spy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(res as Response);

    await expect(polyfillFetch('https://example.com', { method: 'POST' })).resolves.toBe(res);
    expect(spy).toHaveBeenCalledWith('https://example.com', { method: 'POST' });
  });

  it('should not bundle node-only http clients into the build', () => {
    const dist = readFileSync('./dist/index.esm.js', 'utf-8');
    ['cross-fetch', 'node-fetch', 'node:http', 'node:https'].forEach((specifier) => {
      expect(dist).not.toContain(specifier);
    });
  });
});
