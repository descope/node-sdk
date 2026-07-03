import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { List } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockList: List = {
  id: 'l1',
  name: 'blocklist',
  description: 'blocked ips',
  type: 'ip',
  data: ['1.2.3.4'],
};

const okResponse = (body: any) => ({
  ok: true,
  json: () => body,
  clone: () => ({ json: () => Promise.resolve(body) }),
  status: 200,
});

describe('Management Lists', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  it('create sends the correct request', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ list: mockList }));
    const resp: SdkResponse<List> = await management.list.create({
      name: 'blocklist',
      type: 'ip',
    });
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.list.create, {
      name: 'blocklist',
      type: 'ip',
    });
    expect(resp.data).toEqual(mockList);
  });

  it('update merges id into the request', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ list: mockList }));
    await management.list.update('l1', { name: 'blocklist', type: 'ip' });
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.list.update, {
      id: 'l1',
      name: 'blocklist',
      type: 'ip',
    });
  });

  it('load calls the correct url', async () => {
    mockHttpClient.get.mockResolvedValue(okResponse({ list: mockList }));
    const resp = await management.list.load('l1');
    expect(mockHttpClient.get).toHaveBeenCalledWith(`${apiPaths.list.load}/l1`);
    expect(resp.data).toEqual(mockList);
  });

  it('loadAll returns lists', async () => {
    mockHttpClient.get.mockResolvedValue(okResponse({ lists: [mockList] }));
    const resp = await management.list.loadAll();
    expect(mockHttpClient.get).toHaveBeenCalledWith(apiPaths.list.loadAll);
    expect(resp.data).toEqual([mockList]);
  });

  it('checkIP returns the exists flag', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ exists: true }));
    const resp = await management.list.checkIP('l1', '1.2.3.4');
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.list.checkIP, {
      id: 'l1',
      ip: '1.2.3.4',
    });
    expect(resp.data).toEqual(true);
  });

  it('addTexts sends texts', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({}));
    await management.list.addTexts('l1', ['a', 'b']);
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.list.addTexts, {
      id: 'l1',
      texts: ['a', 'b'],
    });
  });
});
