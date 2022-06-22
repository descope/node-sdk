import nock from 'nock'
import { MockAuthConfig, getError } from '../testutils/helpers'
import { HTTPMethods, HTTPStatusCode, request } from '.'
import { RequestError } from './errors'

describe('shared tests', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  class DummyResponse {
    test?: string
  }

  describe('request tests', () => {
    const projectId = 'test'
    const baseURL = 'http://hello.com'
    test('GET request with query params', async () => {
      const conf = new MockAuthConfig({ baseURL })
      conf.mockGet(`/test?param=test`).once().reply(HTTPStatusCode.ok, { test: 'test' })
      const res = await request<DummyResponse>(
        { projectId, baseURL },
        {
          method: HTTPMethods.get,
          params: { param: 'test' },
          url: `test`,
        },
      )
      expect(res.body?.test).toBe('test')
    })

    test('POST request', async () => {
      const conf = new MockAuthConfig({ baseURL })
      conf
        .mockPost(
          `/test`,
          (body) => {
            expect(body?.email).toContain('test')
          },
          {
            reqheaders: {
              'Content-Type': 'application/json',
              test: 'test',
              Cookie: 'key=value',
              Authorization: `Basic ${btoa(`${projectId}:`)}`,
            },
          },
        )
        .once()
        .reply(HTTPStatusCode.ok, { test: 'test' })

      const res = await request<DummyResponse>(
        { projectId, baseURL },
        {
          method: HTTPMethods.post,
          url: `test`,
          cookies: { key: 'value' },
          headers: { test: 'test' },
          data: { email: 'test' },
        },
      )
      expect(res.body?.test).toBe('test')
    })

    test('POST request 401', async () => {
      const conf = new MockAuthConfig()
      conf
        .mockPost(`/test`, (body) => {
          expect(body?.email).toContain('test')
        })
        .once()
        .reply(HTTPStatusCode.unauthorized)

      const res = await getError(async () =>
        request(
          { projectId, baseURL: conf.baseURL },
          {
            method: HTTPMethods.post,
            url: `test`,
            data: { email: 'test' },
          },
        ),
      )
      expect(res instanceof RequestError).toBe(true)
    })

    test('POST request 404', async () => {
      const conf = new MockAuthConfig()
      conf.mockPost(`/test`).once().reply(HTTPStatusCode.notFound)

      const res = await getError(async () =>
        request(
          { projectId, baseURL: conf.baseURL },
          {
            method: HTTPMethods.post,
            url: `test`,
          },
        ),
      )
      expect(res instanceof RequestError).toBe(true)
    })
  })
})
