// this test requires to run `npm run build` before running the test

describe('commonjs build', () => {
  it('should default export a function with constants', () => {
    const DescopeClient = require('../dist/cjs/index.cjs.js') as any; // eslint-disable-line
    expect(typeof DescopeClient).toBe('function');
    // should have constants
    expect(DescopeClient.RefreshTokenCookieName).toBeTruthy();
    expect(DescopeClient.SessionTokenCookieName).toBeTruthy();
    expect(DescopeClient.DescopeErrors).toBeTruthy();
  });
});

export {}; // eslint-disable-line
