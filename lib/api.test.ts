import { DescopeClient } from './api';
import { MockAuthConfig } from './testutils/helpers';

describe('descope client tests', () => {
  test('create descope client', async () => {
    const conf = new MockAuthConfig({ projectId: 'test' });
    const client = new DescopeClient(conf);
    expect(client).not.toBeUndefined();
    expect(client.Auth).not.toBeUndefined();
  });
});
