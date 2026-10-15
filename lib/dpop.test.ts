import { createHash } from 'crypto';
import {
  CompactSign,
  JWK,
  KeyLike,
  SignJWT,
  calculateJwkThumbprint,
  exportJWK,
  generateKeyPair,
} from 'jose';
import createSdk from '.';
import { verifyDPoPProof } from './dpop';

const URL = 'https://api.example.com/resource';

let privateKey: KeyLike;
let publicJwk: JWK;
let sessionToken: string;
let jkt: string;

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const tokenWithClaims = (claims: object) => `${b64({ alg: 'none' })}.${b64(claims)}.sig`;
const athOf = (token: string) => createHash('sha256').update(token).digest('base64url');

type ProofOpts = {
  header?: Record<string, unknown>;
  claims?: Record<string, unknown>;
  key?: KeyLike;
  token?: string;
};

const makeProof = ({ header = {}, claims = {}, key = privateKey, token }: ProofOpts = {}) =>
  new SignJWT({
    jti: `jti-${Math.random()}`,
    htm: 'POST',
    htu: URL,
    iat: Math.floor(Date.now() / 1000),
    ath: athOf(token ?? sessionToken),
    ...claims,
  })
    .setProtectedHeader({ typ: 'dpop+jwt', alg: 'ES256', jwk: publicJwk, ...header })
    .sign(key);

const validate = (proof: string | undefined, store = new Map<string, number>()) =>
  verifyDPoPProof(sessionToken, proof, 'POST', URL, jkt, store);

beforeAll(async () => {
  const pair = await generateKeyPair('ES256');
  privateKey = pair.privateKey;
  publicJwk = await exportJWK(pair.publicKey);
  jkt = await calculateJwkThumbprint(publicJwk);
  sessionToken = tokenWithClaims({ sub: 'u1', cnf: { jkt } });
});

afterEach(() => jest.restoreAllMocks());

describe('verifyDPoPProof', () => {
  it('accepts a valid proof', async () => {
    await expect(validate(await makeProof())).resolves.toBeUndefined();
  });

  const raw = (header: object) => `${b64({ typ: 'dpop+jwt', ...header })}.${b64({})}.sig`;

  it.each<[string, () => Promise<string | undefined> | string | undefined, string]>([
    ['missing', () => undefined, 'DPoP proof required'],
    ['too long', () => 'a'.repeat(8193), 'exceeds maximum length'],
    ['not 3 parts', () => 'a.b', 'exactly 3 parts'],
    ['bad header', () => '!!!.b.c', 'header is not valid'],
    ['wrong typ', () => makeProof({ header: { typ: 'jwt' } }), 'typ'],
    ['alg none', () => raw({ alg: 'none', jwk: publicJwk }), 'is not allowed'],
    ['alg HS256', () => raw({ alg: 'HS256', jwk: publicJwk }), 'is not allowed'],
    ['missing jwk', () => raw({ alg: 'ES256' }), 'must contain a jwk'],
    ['symmetric jwk', () => raw({ alg: 'ES256', jwk: { kty: 'oct', k: 'AA' } }), 'symmetric'],
    ['private jwk', () => makeProof({ header: { jwk: { ...publicJwk, d: 'AA' } } }), 'private key'],
    [
      'non-JSON payload',
      () =>
        new CompactSign(new TextEncoder().encode('not json'))
          .setProtectedHeader({ typ: 'dpop+jwt', alg: 'ES256', jwk: publicJwk })
          .sign(privateKey),
      'payload is not valid JSON',
    ],
    [
      'signer other than the jwk',
      async () => makeProof({ key: (await generateKeyPair('ES256')).privateKey }),
      'signature verification failed',
    ],
    [
      'key other than cnf.jkt',
      async () => {
        const other = await generateKeyPair('ES256');
        const jwk = await exportJWK(other.publicKey);
        return makeProof({ header: { jwk }, key: other.privateKey });
      },
      'does not match the session cnf.jkt',
    ],
  ])('rejects a %s proof', async (_, build, msg) => {
    await expect(validate(await build())).rejects.toThrow(msg);
  });

  it.each<[Record<string, unknown>, string]>([
    [{ jti: undefined }, 'string jti claim'],
    [{ htm: undefined }, 'string htm claim'],
    [{ htu: undefined }, 'string htu claim'],
    [{ ath: undefined }, 'string ath claim'],
    [{ iat: undefined }, 'numeric iat'],
    [{ jti: 'j'.repeat(129) }, 'jti exceeds maximum length'],
    [{ htm: 'GET' }, 'htm'],
    [{ ath: athOf('other') }, 'ath claim does not match'],
    [{ htu: 'https://other.example.com/resource' }, 'htu'],
    [{ htu: 'https://api.example.com/other' }, 'htu'],
    [{ htu: 'not a url' }, 'htu'],
    [{ htu: 'urn:example:resource' }, 'htu'],
  ])('rejects claims %j', async (claims, msg) => {
    await expect(validate(await makeProof({ claims }))).rejects.toThrow(msg);
  });

  it.each([
    ['https://API.example.com:443/resource', URL],
    ['https://api.example.com/resource?q=1#frag', URL],
    ['http://api.example.com:8080/resource', 'http://api.example.com:8080/resource'],
    ['wss://api.example.com/resource', 'wss://api.example.com/resource'],
  ])('accepts htu %s for request %s', async (htu, url) => {
    const proof = await makeProof({ claims: { htu } });
    await expect(
      verifyDPoPProof(sessionToken, proof, 'POST', url, jkt, new Map()),
    ).resolves.toBeUndefined();
  });

  it('compares non-default ports', async () => {
    const proof = await makeProof({ claims: { htu: 'http://api.example.com:8080/resource' } });
    await expect(
      verifyDPoPProof(
        sessionToken,
        proof,
        'POST',
        'http://api.example.com/resource',
        jkt,
        new Map(),
      ),
    ).rejects.toThrow('htu');
  });

  describe('iat window edges', () => {
    const nowSec = 1_700_000_000;
    beforeEach(() => jest.spyOn(Date, 'now').mockReturnValue(nowSec * 1000));

    it.each([59, -4])('accepts an iat %ss old', async (age) => {
      const proof = await makeProof({ claims: { iat: nowSec - age } });
      await expect(validate(proof)).resolves.toBeUndefined();
    });

    it.each([60, -5])('rejects an iat %ss old', async (age) => {
      const proof = await makeProof({ claims: { iat: nowSec - age } });
      await expect(validate(proof)).rejects.toThrow('outside the acceptable window');
    });
  });

  it('does not echo request or proof data in errors', async () => {
    const proof = await makeProof({ claims: { htu: 'https://evil.example.com/x', htm: 'GET' } });
    const err = await verifyDPoPProof(
      sessionToken,
      proof,
      'POST',
      `${URL}?code=secret`,
      jkt,
      new Map(),
    ).catch((e: Error) => e);
    expect(String(err)).not.toMatch(/secret|evil|GET/);
  });

  describe('replay store', () => {
    it('rejects a jti seen twice', async () => {
      const store = new Map<string, number>();
      const proof = await makeProof();
      await expect(validate(proof, store)).resolves.toBeUndefined();
      await expect(validate(proof, store)).rejects.toThrow('replayed');
    });

    it('does not burn the jti of an invalid proof', async () => {
      const store = new Map<string, number>();
      const jti = 'shared-jti';
      await expect(
        validate(await makeProof({ claims: { jti, htm: 'GET' } }), store),
      ).rejects.toThrow('htm');
      expect(store.size).toBe(0);
      await expect(validate(await makeProof({ claims: { jti } }), store)).resolves.toBeUndefined();
    });

    it('accepts a jti again after it expires', async () => {
      const store = new Map<string, number>();
      const start = Date.now();
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(start);
      const jti = 'expiring-jti';
      await validate(await makeProof({ claims: { jti } }), store);
      nowSpy.mockReturnValue(start + 120_000);
      const later = await makeProof({ claims: { jti, iat: Math.floor((start + 120_000) / 1000) } });
      await expect(validate(later, store)).resolves.toBeUndefined();
      expect(store.size).toBe(1);
    });

    it('fails closed when the store is full', async () => {
      const far = Date.now() + 1_000_000;
      const store = new Map(Array.from({ length: 100_000 }, (_, i) => [`j${i}`, far]));
      await expect(validate(await makeProof(), store)).rejects.toThrow('at capacity');
    });
  });
});

describe('DPoP enforcement in session validation', () => {
  const unbound = tokenWithClaims({ sub: 'u1' });
  const claimsOf = (t: string) => JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString());

  const newSdk = () => {
    const sdk = createSdk({ projectId: 'project-id' });
    jest
      .spyOn(sdk, 'validateJwt')
      .mockImplementation(async (jwt) => ({ jwt, token: claimsOf(jwt) }));
    return sdk;
  };
  const dpop = async (opts: ProofOpts = {}) => ({
    proof: await makeProof(opts),
    method: 'POST',
    url: URL,
  });

  it('accepts a bound token with a valid proof', async () => {
    const sdk = newSdk();
    await expect(sdk.validateSession(sessionToken, { dpop: await dpop() })).resolves.toMatchObject({
      jwt: sessionToken,
    });
  });

  it('rejects a bound token without a proof', async () => {
    const sdk = newSdk();
    await expect(
      sdk.validateSession(sessionToken, { dpop: { method: 'POST', url: URL } }),
    ).rejects.toThrow('DPoP proof required');
  });

  it('does not check DPoP when the dpop option is absent', async () => {
    await expect(newSdk().validateSession(sessionToken)).resolves.toMatchObject({
      jwt: sessionToken,
    });
  });

  it.each(['DPoP', 'dpop'])('rejects the %s scheme with an unbound token', async (scheme) => {
    const opts = { dpop: { method: 'POST', url: URL, authorizationScheme: scheme } };
    await expect(newSdk().validateSession(unbound, opts)).rejects.toThrow('not DPoP-bound');
  });

  it('accepts the Bearer scheme with an unbound token', async () => {
    const opts = { dpop: { method: 'POST', url: URL, authorizationScheme: 'Bearer' } };
    await expect(newSdk().validateSession(unbound, opts)).resolves.toMatchObject({ jwt: unbound });
  });

  it('does not refresh around a failed proof', async () => {
    const sdk = newSdk();
    const refresh = jest.spyOn(sdk, 'refreshSession');
    const opts = { dpop: await dpop({ claims: { htm: 'GET' } }) };
    await expect(sdk.validateAndRefreshSession(sessionToken, 'refresh', opts)).rejects.toThrow(
      'htm',
    );
    expect(refresh).not.toHaveBeenCalled();
  });

  it('checks the proof against the session token after a refresh', async () => {
    const sdk = newSdk();
    jest.spyOn(sdk, 'validateSession').mockRejectedValue(new Error('expired'));
    jest
      .spyOn(sdk, 'refreshSession')
      .mockResolvedValue({ jwt: 'new', token: claimsOf(sessionToken) });
    const good = { dpop: await dpop() };
    await expect(sdk.validateAndRefreshSession(sessionToken, 'r', good)).resolves.toMatchObject({
      jwt: 'new',
    });
    const bad = { dpop: await dpop({ claims: { htm: 'GET' } }) };
    await expect(sdk.validateAndRefreshSession(sessionToken, 'r', bad)).rejects.toThrow('htm');
  });

  describe('after a refresh, the key comes from the refreshed token', () => {
    const refreshedSdk = () => {
      const sdk = newSdk();
      jest.spyOn(sdk, 'validateSession').mockRejectedValue(new Error('expired'));
      jest
        .spyOn(sdk, 'refreshSession')
        .mockResolvedValue({ jwt: 'new', token: claimsOf(sessionToken) });
      return sdk;
    };

    it('rejects an empty session token', async () => {
      const opts = { dpop: await dpop() };
      await expect(refreshedSdk().validateAndRefreshSession('', 'r', opts)).rejects.toThrow(
        'requires the session token',
      );
    });

    it('rejects a forged unbound session token without a proof', async () => {
      const opts = { dpop: { method: 'POST', url: URL } };
      await expect(refreshedSdk().validateAndRefreshSession(unbound, 'r', opts)).rejects.toThrow(
        'DPoP proof required',
      );
    });

    it("rejects a forged session token bound to the caller's own key", async () => {
      const other = await generateKeyPair('ES256');
      const jwk = await exportJWK(other.publicKey);
      const forged = tokenWithClaims({
        sub: 'u1',
        cnf: { jkt: await calculateJwkThumbprint(jwk) },
      });
      const proof = await makeProof({ header: { jwk }, key: other.privateKey, token: forged });
      const opts = { dpop: { proof, method: 'POST', url: URL } };
      await expect(refreshedSdk().validateAndRefreshSession(forged, 'r', opts)).rejects.toThrow(
        'does not match the session cnf.jkt',
      );
    });
  });

  it('rejects a proof replayed on the same SDK instance', async () => {
    const sdk = newSdk();
    const opts = { dpop: await dpop() };
    await sdk.validateSession(sessionToken, opts);
    await expect(sdk.validateSession(sessionToken, opts)).rejects.toThrow('replayed');
  });

  it('passes verify options without dpop to the inner calls', async () => {
    const sdk = newSdk();
    const validateSpy = jest.spyOn(sdk, 'validateSession');
    await sdk.validateAndRefreshSession(sessionToken, 'r', { audience: 'a', dpop: await dpop() });
    expect(validateSpy).toHaveBeenCalledWith(sessionToken, { audience: 'a' });
  });
});
