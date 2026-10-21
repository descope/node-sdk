import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { ScopeClaimMappingEntry } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockMappings: ScopeClaimMappingEntry[] = [
  { scope: 'email', claims: { email: 'email' }, description: 'email scope' },
];

const okResponse = (body: any) => ({
  ok: true,
  json: () => body,
  clone: () => ({ json: () => Promise.resolve(body) }),
  status: 200,
});

describe('Management Scope Claim Mapping', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  it('get returns mappings', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ mappings: mockMappings }));
    const resp: SdkResponse<ScopeClaimMappingEntry[]> = await management.scopeClaimMapping.get();
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.scopeClaimMapping.get, {});
    expect(resp.data).toEqual(mockMappings);
  });

  it('set sends mappings', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({}));
    await management.scopeClaimMapping.set(mockMappings);
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.scopeClaimMapping.set, {
      mappings: mockMappings,
    });
  });

  it('delete sends an empty body', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({}));
    await management.scopeClaimMapping.delete();
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.scopeClaimMapping.delete, {});
  });
});
