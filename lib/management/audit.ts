import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { AuditSearchOptions, AuditRecord, AuditCreateOptions } from './types';

const WithAudit = (httpClient: HttpClient) => ({
  /**
   * Search the audit trail for up to last 30 days based on given optional parameters
   * @param searchOptions to filter which audit records to return
   * @returns the audit records array
   */
  search: (searchOptions: AuditSearchOptions): Promise<SdkResponse<AuditRecord[]>> => {
    const body = { ...searchOptions, externalIds: searchOptions.loginIds };
    delete body.loginIds;
    return transformResponse(httpClient.post(apiPaths.audit.search, body), (data) =>
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
  /**
   * Create audit event
   * @param createOptions to define which audit event to create
   * @returns the audit records array
   */
  createEvent: (createOptions: AuditCreateOptions): Promise<SdkResponse<never>> => {
    const body = { ...createOptions };
    return transformResponse(httpClient.post(apiPaths.audit.createEvent, body));
  },
});

export default WithAudit;
