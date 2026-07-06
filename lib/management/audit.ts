import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  AuditSearchOptions,
  AuditRecord,
  AuditCreateOptions,
  AuditWebhook,
  AuditSearchAllResponse,
} from './types';

const transformAuditRecords = (data: any): AuditRecord[] =>
  data?.audits.map((a) => {
    const res = {
      ...a,
      occurred: parseFloat(a.occurred),
      loginIds: a.externalIds,
    };
    delete res.externalIds;
    return res;
  });

const WithAudit = (httpClient: HttpClient) => ({
  /**
   * Search the audit trail for up to last 30 days based on given optional parameters
   * @param searchOptions to filter which audit records to return
   * @returns the audit records array
   */
  search: (searchOptions: AuditSearchOptions): Promise<SdkResponse<AuditRecord[]>> => {
    const body = { ...searchOptions, externalIds: searchOptions.loginIds };
    delete body.loginIds;
    return transformResponse(httpClient.post(apiPaths.audit.search, body), transformAuditRecords);
  },
  /**
   * Search the audit trail for up to last 30 days based on given optional parameters,
   * returning both the matching audit records and the total number of results.
   * @param searchOptions to filter which audit records to return
   * @returns the audit records array along with the total count
   */
  searchAll: (searchOptions: AuditSearchOptions): Promise<SdkResponse<AuditSearchAllResponse>> => {
    const body = { ...searchOptions, externalIds: searchOptions.loginIds };
    delete body.loginIds;
    return transformResponse(httpClient.post(apiPaths.audit.search, body), (data) => ({
      audits: transformAuditRecords(data),
      total: data?.total,
    }));
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
  /**
   * Create an audit webhook connector that streams audit events to an external endpoint.
   * @param options the audit webhook configuration
   */
  createAuditWebhook: (options: AuditWebhook): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.audit.createAuditWebhook, options)),
});

export default WithAudit;
