import { JWTError } from 'errors';
import nock from 'nock';
import { getError, MockAuthConfig } from '../testutils/helpers';
import { DeliveryMethod, HTTP_STATUS_CODE } from '../shared';
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
          expect(body?.email).toContain('test');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {});
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
          expect(body?.sms).toContain('test');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignInOTP({ deliveryMethod: DeliveryMethod.SMS, identifier: 'test' });
      expect(res).toBeUndefined();
    });

    test('whatsapp defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/signin/otp/${DeliveryMethod.whatsapp}`, (body) => {
          expect(body?.whatsapp).toContain('test');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {});
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
        .reply(HTTP_STATUS_CODE.ok, {});
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
        .reply(HTTP_STATUS_CODE.ok, {});
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
        .reply(HTTP_STATUS_CODE.ok, {});
      const auth = new Auth(conf);
      const res = await auth.SignUpOTP({
        deliveryMethod: DeliveryMethod.SMS,
        identifier: 'test',
        user: { username: 'user' },
      });
      expect(res).toBeUndefined();
    });
  });

  describe('OTP verify', () => {
    test('whatsapp defaults', async () => {
      const conf = new MockAuthConfig();
      conf
        .mockPost(`/auth/code/verify/${DeliveryMethod.whatsapp}`, (body) => {
          expect(body?.whatsapp).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {}, { 'Set-Cookie': ['hello'] });
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
          expect(body?.email).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {}, { 'Set-Cookie': ['hello'] });
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
          expect(body?.sms).toEqual('test');
          expect(body?.code).toEqual('1111');
        })
        .once()
        .reply(HTTP_STATUS_CODE.ok, {}, { 'Set-Cookie': ['hello'] });
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

  describe('validate session', () => {
    test('valid jwt', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/keys/${GetMocks().projectID}`)
        .once()
        .reply(HTTP_STATUS_CODE.ok, [GetMocks().PublicKeys.valid]);
      const auth = new Auth(conf);
      const res = await auth.ValidateSession(GetMocks().JWT.valid, GetMocks().JWT.valid);
      expect(res).not.toBeUndefined();
    });

    test('refresh expired jwt', async () => {
      const conf = new MockAuthConfig({ projectId: GetMocks().projectID });
      conf
        .mockGet(`/keys/${GetMocks().projectID}`)
        .once()
        .reply(HTTP_STATUS_CODE.ok, [GetMocks().PublicKeys.valid]);
      conf
        .mockGet('/refresh')
        .once()
        .reply(HTTP_STATUS_CODE.ok, {}, { 'Set-Cookie': ['hello'] });

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
        .reply(HTTP_STATUS_CODE.ok, [GetMocks().PublicKeys.valid]);
      conf.mockGet('/refresh').once().reply(HTTP_STATUS_CODE.internalServerError, {});

      const auth = new Auth(conf);
      const res = await getError(async () => {
        await auth.ValidateSession(GetMocks().JWT.expired, GetMocks().JWT.valid);
      });
      expect(res instanceof JWTError).toBeTruthy();
    });
  });
});
