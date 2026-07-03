import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { JWTTemplate, JWTTemplateLibraryEntry } from './types';
import { mockHttpClient, resetMockHttpClient } from './testutils';

const management = withManagement(mockHttpClient);

const mockTemplate: JWTTemplate = {
  id: 't1',
  name: 'my-template',
  template: { foo: 'bar' },
};

const okResponse = (body: any) => ({
  ok: true,
  json: () => body,
  clone: () => ({ json: () => Promise.resolve(body) }),
  status: 200,
});

describe('Management JWT Templates', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  it('create sends the template wrapped', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ template: mockTemplate }));
    const resp: SdkResponse<JWTTemplate> = await management.jwtTemplate.create(mockTemplate);
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.create, {
      template: mockTemplate,
    });
    expect(resp.data).toEqual(mockTemplate);
  });

  it('update sends the template wrapped', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ template: mockTemplate }));
    const resp = await management.jwtTemplate.update(mockTemplate);
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.update, {
      template: mockTemplate,
    });
    expect(resp.data).toEqual(mockTemplate);
  });

  it('load returns the template', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ template: mockTemplate }));
    const resp = await management.jwtTemplate.load('t1');
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.load, { id: 't1' });
    expect(resp.data).toEqual(mockTemplate);
  });

  it('list returns templates', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ templates: [mockTemplate] }));
    const resp = await management.jwtTemplate.list();
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.list, {});
    expect(resp.data).toEqual([mockTemplate]);
  });

  it('delete sends the id', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({}));
    await management.jwtTemplate.delete('t1');
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.delete, { id: 't1' });
  });

  it('validate returns the validation result', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ valid: true }));
    const resp = await management.jwtTemplate.validate('t1');
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.validate, {
      id: 't1',
      template: undefined,
    });
    expect(resp.data).toEqual({ valid: true });
  });

  it('listLibrary returns entries', async () => {
    const entry: JWTTemplateLibraryEntry = { id: 'lib1', name: 'lib-template' };
    mockHttpClient.post.mockResolvedValue(okResponse({ entries: [entry] }));
    const resp = await management.jwtTemplate.listLibrary();
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.libraryList, {});
    expect(resp.data).toEqual([entry]);
  });

  it('loadLibraryEntry returns the entry', async () => {
    const entry: JWTTemplateLibraryEntry = { id: 'lib1', name: 'lib-template' };
    mockHttpClient.post.mockResolvedValue(okResponse({ entry }));
    const resp = await management.jwtTemplate.loadLibraryEntry('lib1');
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.libraryLoad, {
      id: 'lib1',
    });
    expect(resp.data).toEqual(entry);
  });

  it('applyFromLibrary sends the request', async () => {
    mockHttpClient.post.mockResolvedValue(okResponse({ template: mockTemplate }));
    await management.jwtTemplate.applyFromLibrary({ libraryEntryId: 'lib1' });
    expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.jwtTemplate.libraryApply, {
      libraryEntryId: 'lib1',
    });
  });
});
