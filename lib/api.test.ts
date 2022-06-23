import { MissingArgumentError } from './shared/errors'
import { DescopeClient } from './api'
import { getError, MockAuthConfig } from './testutils/helpers'

describe('descope client tests', () => {
  test('create descope client', async () => {
    const conf = new MockAuthConfig({ projectId: 'test' })
    const client = new DescopeClient(conf)
    expect(client).not.toBeUndefined()
    expect(client.Auth).not.toBeUndefined()
  })

  test('create descope client without project id', async () => {
    const conf = new MockAuthConfig({ projectId: '' })
    const client = await getError(() => new DescopeClient(conf))
    expect(client instanceof MissingArgumentError).toBeTruthy()
  })
})
