import { SdkResponse, transformResponse } from '@descope/core-js-sdk';
import { CoreSdk } from '../types';
import apiPaths from './paths';
import { AuditSearchOptions, AuditRecord } from './types';

const WithAudit = (sdk: CoreSdk, managementKey?: string) => ({
  /**
   * Search the audit trail for up to last 30 days based on given optional parameters
   * @param searchOptions to filter which audit records to return
   * @returns the audit records array
   */
  search: (searchOptions: AuditSearchOptions): Promise<SdkResponse<AuditRecord[]>> => {
    const body = { ...searchOptions, externalIds: searchOptions.loginIds };
    delete body.loginIds;
    return transformResponse(
      sdk.httpClient.post(apiPaths.audit.search, body, { token: managementKey }),
      (data) =>
        data?.audits.map((a) => {
          const res = {
            ...a,
            occurred: parseFloat(a.occurred),
            loginIds: a.externalIds,
          };
          delete res.externalIds;
          return res;
        }),
    );
  },
});

export default WithAudit;
