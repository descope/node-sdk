import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import {
  ExportSnapshotResponse,
  ImportSnapshotRequest,
  Project,
  ValidateSnapshotRequest,
  ValidateSnapshotResponse,
} from './types';

const management = withManagement(mockHttpClient);

const mockMgmtListProjectsResponse = {
  projects: [
    {
      id: '1',
      name: '2',
      tag: '',
      environment: '',
      tags: ['hey', 'sup'],
    },
  ],
};

const mockListProjectsResponse: Project[] = [
  {
    id: '1',
    name: '2',
    environment: '',
    tags: ['hey', 'sup'],
  },
];

describe('Management Project', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('updateName', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const name = 'new project name';
      const resp = await management.project.updateName(name);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.updateName, { name });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('updateTags', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => {},
        clone: () => ({
          json: () => Promise.resolve({}),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const tags = ['tag1!', 'tag2'];
      const resp = await management.project.updateTags(tags);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.updateTags, { tags });

      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('projectsList', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtListProjectsResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtListProjectsResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<Project[]> = await management.project.listProjects();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.projectsList, {});
      expect(resp).toEqual({
        code: 200,
        data: mockListProjectsResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('clone', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockCloneProjectResponse = {
        projectId: 'id1',
        projectName: 'name1',
      };

      const httpResponse = {
        ok: true,
        json: () => mockCloneProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockCloneProjectResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const name = 'name1';
      const environment = 'production';
      const tags = ['tag1', 'tag2@'];
      const resp = await management.project.clone('name1', environment, tags);
      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.clone, {
        name,
        environment,
        tags,
      });

      expect(resp).toEqual({
        code: 200,
        data: mockCloneProjectResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('exportSnapshot', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockExportSnapshotResponse: ExportSnapshotResponse = {
        files: {
          'foo/bar.json': {
            foo: 'bar',
          },
        },
      };

      const httpResponse = {
        ok: true,
        json: () => mockExportSnapshotResponse,
        clone: () => ({
          json: () => Promise.resolve(mockExportSnapshotResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.project.exportSnapshot();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.exportSnapshot, {});

      expect(resp).toEqual({
        code: 200,
        data: mockExportSnapshotResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('importSnapshot', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockImportSnapshotResponse = {};

      const httpResponse = {
        ok: true,
        json: () => mockImportSnapshotResponse,
        clone: () => ({
          json: () => Promise.resolve(mockImportSnapshotResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const importSnapshotRequest: ImportSnapshotRequest = {
        files: { 'foo/bar.json': { foo: 'bar' } },
        inputSecrets: {
          connectors: [{ id: 'i', name: 'n', type: 't', value: 'v' }],
          oauthProviders: [{ id: 'a', name: 'b', type: 'c', value: 'd' }],
        },
      };

      const resp = await management.project.importSnapshot(importSnapshotRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.project.importSnapshot,
        importSnapshotRequest,
      );

      expect(resp).toEqual({
        code: 200,
        data: mockImportSnapshotResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('validateSnapshot', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockSecrets = {
        connectors: [{ id: 'i', name: 'n', type: 't', value: 'v' }],
        oauthProviders: [{ id: 'a', name: 'b', type: 'c', value: 'd' }],
      };

      const mockValidateSnapshotResponse: ValidateSnapshotResponse = {
        ok: true,
        failures: ['a'],
        missingSecrets: mockSecrets,
      };

      const httpResponse = {
        ok: true,
        json: () => mockValidateSnapshotResponse,
        clone: () => ({
          json: () => Promise.resolve(mockValidateSnapshotResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const validateSnapshotRequest: ValidateSnapshotRequest = {
        files: { 'foo/bar.json': { foo: 'bar' } },
        inputSecrets: mockSecrets,
      };

      const resp = await management.project.validateSnapshot(validateSnapshotRequest);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.project.validateSnapshot,
        validateSnapshotRequest,
      );

      expect(resp).toEqual({
        code: 200,
        data: mockValidateSnapshotResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('export deprecated', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockExportProjectResponse = {
        files: {
          'foo/bar.json': {
            foo: 'bar',
          },
        },
      };

      const httpResponse = {
        ok: true,
        json: () => mockExportProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockExportProjectResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.project.export();

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.exportSnapshot, {});

      expect(resp).toEqual({
        code: 200,
        data: mockExportProjectResponse.files,
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('import deprecated', () => {
    it('should send the correct request and receive correct response', async () => {
      const mockImportProjectResponse = {};

      const httpResponse = {
        ok: true,
        json: () => mockImportProjectResponse,
        clone: () => ({
          json: () => Promise.resolve(mockImportProjectResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.project.import({ 'foo/bar.json': { foo: 'bar' } });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.project.importSnapshot, {
        files: {
          'foo/bar.json': {
            foo: 'bar',
          },
        },
      });

      expect(resp).toEqual({
        code: 200,
        data: mockImportProjectResponse,
        ok: true,
        response: httpResponse,
      });
    });
  });
});
