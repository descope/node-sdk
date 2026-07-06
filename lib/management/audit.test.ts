import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockHttpClient, resetMockHttpClient } from './testutils';
import { AuditRecord } from './types';

const management = withManagement(mockHttpClient);

const mockMgmtAuditRecord = {
  projectId: 'p1',
  userId: 'u1',
  action: 'a1',
  occurred: Date.now().toString(),
  externalIds: ['id1', 'id2'],
  data: {
    f1: 1,
    d2: '2',
  },
};

const mockMgmtAuditSearchResponse = {
  audits: [mockMgmtAuditRecord],
};

const mockMgmtAuditSearchAllResponse = {
  audits: [mockMgmtAuditRecord],
  total: 1,
};

describe('Management Audit', () => {
  afterEach(() => {
    jest.clearAllMocks();
    resetMockHttpClient();
  });

  describe('search', () => {
    it('should send the correct request and receive correct response', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtAuditSearchResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtAuditSearchResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp: SdkResponse<AuditRecord[]> = await management.audit.search({ loginIds: ['id1'] });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.audit.search, {
        externalIds: ['id1'],
      });
      const res = {
        ...mockMgmtAuditRecord,
        loginIds: mockMgmtAuditRecord.externalIds,
        occurred: parseFloat(mockMgmtAuditRecord.occurred),
      };
      delete res.externalIds;
      expect(resp).toEqual({
        code: 200,
        data: [res],
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('searchAll', () => {
    it('should send the correct request and receive records with the total count', async () => {
      const httpResponse = {
        ok: true,
        json: () => mockMgmtAuditSearchAllResponse,
        clone: () => ({
          json: () => Promise.resolve(mockMgmtAuditSearchAllResponse),
        }),
        status: 200,
      };
      mockHttpClient.post.mockResolvedValue(httpResponse);

      const resp = await management.audit.searchAll({ loginIds: ['id1'] });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.audit.search, {
        externalIds: ['id1'],
      });
      const record = {
        ...mockMgmtAuditRecord,
        loginIds: mockMgmtAuditRecord.externalIds,
        occurred: parseFloat(mockMgmtAuditRecord.occurred),
      };
      delete record.externalIds;
      expect(resp).toEqual({
        code: 200,
        data: { audits: [record], total: 1 },
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('createAuditWebhook', () => {
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

      const webhook = {
        name: 'my-webhook',
        url: 'https://webhook.example.com',
        headers: { 'x-custom': 'value' },
      };
      const resp: SdkResponse<never> = await management.audit.createAuditWebhook(webhook);

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.audit.createAuditWebhook, webhook);
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });

  describe('create event', () => {
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

      const resp: SdkResponse<never> = await management.audit.createEvent({
        userId: 'userId',
        type: 'info',
        action: 'action',
        actorId: 'actorId',
        tenantId: 'tenantId',
        data: { a: 'b' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(apiPaths.audit.createEvent, {
        userId: 'userId',
        type: 'info',
        action: 'action',
        actorId: 'actorId',
        tenantId: 'tenantId',
        data: { a: 'b' },
      });
      expect(resp).toEqual({
        code: 200,
        data: {},
        ok: true,
        response: httpResponse,
      });
    });
  });
});
