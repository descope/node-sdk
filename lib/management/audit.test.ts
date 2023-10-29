import { SdkResponse } from '@descope/core-js-sdk';
import withManagement from '.';
import apiPaths from './paths';
import { mockCoreSdk, mockHttpClient } from './testutils';
import { AuditRecord } from './types';

const management = withManagement(mockCoreSdk, 'key');

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

describe('Management Audit', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockHttpClient.reset();
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

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        apiPaths.audit.search,
        { externalIds: ['id1'] },
        { token: 'key' },
      );
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
});
