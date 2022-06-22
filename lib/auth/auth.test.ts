import nock from 'nock';
import { JWTError, RequestError, ServiceError } from '../shared/errors';
import { getError, MockAuthConfig } from '../testutils/helpers';
import { DeliveryMethod, HTTPStatusCode, LOCATION_HEADER, OAuthProvider } from '../shared';
import { GetMocks } from '../testutils/mocks';
import { Auth } from './auth';

describe('Authentication tests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  describe('OTP sign in', () => {
    test('email defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signin/otp/${DeliveryMethod.email}`, (body) => {
          expect(body?.externalID).toContain('test');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignInOTP({
        deliveryMethod: DeliveryMethod.email,
        identifier: 'test',
      });
      expect(res).toBeUndefined();
    });

    test('sms defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signin/otp/${DeliveryMethod.SMS}`, (body) => {
          expect(body?.externalID).toContain('test');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignInOTP({ deliveryMethod: DeliveryMethod.SMS, identifier: 'test' });
      expect(res).toBeUndefined();
    });

    test('whatsapp defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signin/otp/${DeliveryMethod.whatsapp}`, (body) => {
          expect(body?.externalID).toContain('test');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignInOTP({
        deliveryMethod: DeliveryMethod.whatsapp,
        identifier: 'test',
      });
      expect(res).toBeUndefined();
    });
  });

  describe('OTP sign up', () => {
    test('whatsapp defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signup/otp/${DeliveryMethod.whatsapp}`, (body) => {
          expect(body?.whatsapp).toEqual('test');
          expect(body?.user?.username).toEqual('user');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignUpOTP({
        deliveryMethod: DeliveryMethod.whatsapp,
        identifier: 'test',
        user: { username: 'user' },
      });
      expect(res).toBeUndefined();
    });

    test('email defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signup/otp/${DeliveryMethod.email}`, (body) => {
          expect(body?.email).toEqual('test');
          expect(body?.user?.username).toEqual('user');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignUpOTP({
        deliveryMethod: DeliveryMethod.email,
        identifier: 'test',
        user: { username: 'user' },
      });
      expect(res).toBeUndefined();
    });

    test('sms defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signup/otp/${DeliveryMethod.SMS}`, (body) => {
          expect(body?.sms).toEqual('test');
          expect(body?.user?.username).toEqual('user');
        })
        .once()
        .reply(HTTPStatusCode.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignUpOTP({
        deliveryMethod: DeliveryMethod.SMS,
        identifier: 'test',
        user: { username: 'user' },
      });
      expect(res).toBeUndefined();
    });

    test('sms web error failure', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signup/otp/${DeliveryMethod.SMS}`, (body) => {
          expect(body?.sms).toEqual('test');
          expect(body?.user?.username).toEqual('user');
        })
        .once()
        .reply(HTTPStatusCode.badRequest, { message: '[] bad', code: 2 });
      const auth = new Auth(conf);
      const err = await getError<ServiceError>(async () =>
        auth.SignUpOTP({
          deliveryMethod: DeliveryMethod.SMS,
          identifier: 'test',
          user: { username: 'user' },
        }),
      );
      expect(err.message).toContain('bad');
    });

    test('sms request error failure', async () => {
      const conf = new MockAuthConfig();
      const url = `auth/signup/otp/${DeliveryMethod.SMS}`;
      conf
        .mockPost(`/${url}`, (body) => {
          expect(body?.sms).toEqual('test');
          expect(body?.user?.username).toEqual('user');
        })
        .once()
        .replyWithError('this is error');
      const auth = new Auth(conf);
      const err = await getError<RequestError>(async () =>
        auth.SignUpOTP({
          deliveryMethod: DeliveryMethod.SMS,
          identifier: 'test',
          user: { username: 'user' },
        }),
      );
      expect(err.message).toContain('error');
      expect(err.request?.url).toBe(url);
    });
  });

  describe('OTP verify', () => {
    test('whatsapp defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/code/verify/${DeliveryMethod.whatsapp}`, (body) => {
          expect(body?.externalID).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTPStatusCode.ok, {}, { 'Set-Cookie': ['hello'] });
      const auth = new Auth(conf);
      const res = await auth.VerifyCode({
        deliveryMethod: DeliveryMethod.whatsapp,
        identifier: 'test',
        code: '1111',
      });
      expect(res?.cookies).toHaveLength(1);
      expect(res?.cookies ? res?.cookies[0] : '').toBe('hello');
    });

    test('email defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/code/verify/${DeliveryMethod.email}`, (body) => {
          expect(body?.externalID).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTPStatusCode.ok, {}, { 'Set-Cookie': ['hello'] });
      const auth = new Auth(conf);
      const res = await auth.VerifyCode({
        deliveryMethod: DeliveryMethod.email,
        identifier: 'test',
        code: '1111',
      });
      expect(res?.cookies).toHaveLength(1);
      expect(res?.cookies ? res?.cookies[0] : '').toBe('hello');
    });

    test('sms defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/code/verify/${DeliveryMethod.SMS}`, (body) => {
          expect(body?.externalID).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTPStatusCode.ok, {}, { 'Set-Cookie': ['hello'] });
      const auth = new Auth(conf);
      const res = await auth.VerifyCode({
        deliveryMethod: DeliveryMethod.SMS,
        identifier: 'test',
        code: '1111',
      });
      expect(res?.cookies).toHaveLength(1);
      expect(res?.cookies ? res?.cookies[0] : '').toBe('hello');
    });
  });

  describe('logout', () => {
    test('valid logout', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockPost(`/auth/logoutall`)
        .once()
        .reply(HTTPStatusCode.ok, {}, { 'Set-Cookie': ['DS=', 'DSR='] });
      const auth = new Auth(conf);
      const res = await auth.Logout(GetMocks().JWT.valid, GetMocks().JWT.valid);
      expect(res).not.toBeUndefined();
      expect(res?.cookies).toHaveLength(2);
      expect(res?.cookies && res.cookies[0]).toBe('DS=');
      expect(res?.cookies && res.cookies[1]).toBe('DSR=');
    });

    test('logout failure', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockPost(`/auth/logoutall`)
        .once()
        .reply(HTTPStatusCode.internalServerError, { error: 'this is an error' });
      const auth = new Auth(conf);
      const res = await getError<ServiceError>(async () =>
        auth.Logout(GetMocks().JWT.valid, GetMocks().JWT.valid),
      );
      expect(res).not.toBeUndefined();
      expect(res?.error).toBe('this is an error');
    });
  });

  describe('OAuth', () => {
    const url = 'http://test.com';
    test('OAuth redirect', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/oauth/authorize?provider=github`)
        .once()
        .reply(HTTPStatusCode.ok, {}, { [LOCATION_HEADER]: url });
      const auth = new Auth(conf);
      const res = await auth.StartOAuth(OAuthProvider.github);
      expect(res).toBe(url);
    });

    test('OAuth failure', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/oauth/authorize?provider=apple`)
        .once()
        .reply(HTTPStatusCode.badRequest, { error: 'this is an error' }, {});
      const auth = new Auth(conf);
      const res = await getError<ServiceError>(async () => auth.StartOAuth(OAuthProvider.apple));
      expect(res?.error).toContain('error');
    });

    test('OAuth no location header', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf.mockGet(`/oauth/authorize?provider=apple`).once().reply(HTTPStatusCode.ok, {}, {});
      const auth = new Auth(conf);
      const res = await getError<RequestError>(async () => auth.StartOAuth(OAuthProvider.apple));
      expect(res?.request?.url).toContain('oauth/authorize');
    });
  });

  describe('validate session', () => {
    test('valid jwt', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/keys/${GetMocks().projectID}`)
        .once()
        .reply(HTTPStatusCode.ok, [GetMocks().PublicKeys.valid]);
      const auth = new Auth(conf);
      const res = await auth.ValidateSession(GetMocks().JWT.valid, GetMocks().JWT.valid);
      expect(res).not.toBeUndefined();
    });

    test('refresh expired jwt', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/keys/${GetMocks().projectID}`)
        .once()
        .reply(HTTPStatusCode.ok, [GetMocks().PublicKeys.valid]);
      conf
        .mockGet('/refresh')
        .once()
        .reply(HTTPStatusCode.ok, {}, { 'Set-Cookie': ['hello'] });

      const auth = new Auth(conf);
      const res = await auth.ValidateSession(GetMocks().JWT.expired, GetMocks().JWT.valid);
      expect(res).not.toBeUndefined();
      expect(res?.cookies).toHaveLength(1);
      expect(res?.cookies ? res?.cookies[0] : '').toBe('hello');
    });

    test('validate session empty jwt', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      const auth = new Auth(conf);
      const error = await getError(async () => auth.ValidateSession('', ''));
      expect(error?.message).toContain('empty');
    });

    test('validate expired jwts', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      const auth = new Auth(conf);
      const error = await getError(async () =>
        auth.ValidateSession(GetMocks().JWT.expired, GetMocks().JWT.expired),
      );
      expect(error).toBeInstanceOf(JWTError);
    });

    test('refresh refresh jwt failure', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/keys/${GetMocks().projectID}`)
        .once()
        .reply(HTTPStatusCode.ok, [GetMocks().PublicKeys.valid]);
      conf.mockGet('/refresh').once().reply(HTTPStatusCode.internalServerError, {});

      const auth = new Auth(conf);
      const res = await getError(async () => {
        await auth.ValidateSession(GetMocks().JWT.expired, GetMocks().JWT.valid);
      });
      expect(res instanceof JWTError).toBeTruthy();
    });
  });
});
