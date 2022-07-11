import { btoa } from 'buffer'
import fetch, { RequestInit, Headers, Response, Request } from 'node-fetch'
import { URL } from 'url'
import { RequestError, ServerError } from './errors'
import { HTTPMethods, IConfig } from './types'

// @ts-ignore
globalThis.fetch = fetch
// @ts-ignore
globalThis.Headers = Headers
// @ts-ignore
globalThis.Request = Request
// @ts-ignore
globalThis.Response = Response

export const LOCATION_HEADER = 'Location'

export type RequestData = {
  url: string
  method: HTTPMethods
  params?: Record<string, string | number>
  headers?: Record<string, string | number>
  password?: string
  data?: unknown
}

export class HttpResponse<T> {
  request!: RequestInit

  response!: Response

  body?: T
}

export async function request<T>(
  requestConfig: IConfig,
  requestData: RequestData,
): Promise<HttpResponse<T>> {
  const url = new URL(requestData.url, requestConfig.baseURL)
  if (requestData.params) {
    Object.entries(requestData.params).forEach(([key, value]) =>
      url.searchParams.append(key, String(value)),
    )
  }

  const headers = new Headers(requestConfig.headers)
  if (requestData.method === HTTPMethods.post) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set(
    'Authorization',
    `Basic ${btoa(`${requestConfig.projectId}:${requestData.password}`)}`,
  )

  let response: Response
  const options: RequestInit = {
    method: requestData.method,
    redirect: 'manual',
    body: JSON.stringify(requestData.data),
    ...requestConfig,
    headers,
    timeout: (requestConfig.timeoutSeconds || 0) * 1000,
  }
  try {
    requestConfig.logger?.debug(
      `requesting ${url.toString()} with options [${JSON.stringify(options)}]`,
    )
    response = await fetch(url.toString(), options)
  } catch (e) {
    throw new RequestError(requestData, e as Error)
  }

  let tResponse: unknown
  try {
    tResponse = await response.json()
  } catch (e) {
    const err = e as Error
    throw new RequestError(requestData, err)
  }

  if (response.status >= 400) {
    const webError = tResponse as ServerError
    webError.status = response.status
    requestConfig.logger?.error(
      `request to ${url.toString()} failed with status ${response.status}${
        webError?.message ? `: ${webError?.message}` : ''
      }`,
    )
    throw webError
  }

  return { request: options, response, body: tResponse as T }
}
