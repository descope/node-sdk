import { HttpClient, SdkResponse, transformResponse } from '@descope/core-js-sdk';
import apiPaths from './paths';
import { AnalyticRecord, AnalyticsSearchOptions } from './types';

const withAnalytics = (httpClient: HttpClient) => ({
  search: (options: AnalyticsSearchOptions): Promise<SdkResponse<AnalyticRecord[]>> =>
    transformResponse(
      httpClient.post(apiPaths.analytics.search, options),
      (data) => data.analytics,
    ),
});

export default withAnalytics;
