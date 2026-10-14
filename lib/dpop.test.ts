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
import { validateDPoPProof } from './dpop';

const URL = 'https://api.example.com/resource';

let privateKey: KeyLike;
let publicJwk: JWK;
let sessionToken: string;

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
  validateDPoPProof(sessionToken, proof, 'POST', URL, store);

beforeAll(async () => {
  const pair = await generateKeyPair('ES256');
  privateKey = pair.privateKey;
  publicJwk = await exportJWK(pair.publicKey);
  sessionToken = tokenWithClaims({
    sub: 'u1',
    cnf: { jkt: await calculateJwkThumbprint(publicJwk) },
  });
});

afterEach(() => jest.restoreAllMocks());

describe('validateDPoPProof', () => {
  it('accepts a valid proof', async () => {
    await expect(validate(await makeProof())).resolves.toBeUndefined();
  });

  it('is a no-op for a token without cnf.jkt', async () => {
    await expect(
      validateDPoPProof(tokenWithClaims({ sub: 'u1' }), undefined, 'POST', URL, new Map()),
    ).resolves.toBeUndefined();
  });

  it.each([
    ['not a JWT', 'abc', 'not a valid JWT'],
    ['bad payload', 'a.!!!.c', 'could not decode JWT payload'],
  ])('rejects a malformed session token (%s)', async (_, token, msg) => {
    await expect(validateDPoPProof(token, undefined, 'POST', URL, new Map())).rejects.toThrow(msg);
  });

  it.each([
    ['missing', undefined, 'DPoP proof required'],
    ['too long', 'a'.repeat(8193), 'exceeds maximum length'],
    ['not 3 parts', 'a.b', 'exactly 3 parts'],
    ['bad header', '!!!.b.c', 'header is not valid'],
  ])('rejects a %s proof', async (_, proof, msg) => {
    await expect(validate(proof)).rejects.toThrow(msg);
  });

  it('rejects a wrong typ', async () => {
    await expect(validate(await makeProof({ header: { typ: 'jwt' } }))).rejects.toThrow('typ');
  });

  it.each(['none', 'HS256'])('rejects alg %s', async (alg) => {
    const proof = `${b64({ typ: 'dpop+jwt', alg, jwk: publicJwk })}.${b64({})}.`;
    await expect(validate(proof)).rejects.toThrow('is not allowed');
  });

  it('rejects a missing jwk', async () => {
    const proof = `${b64({ typ: 'dpop+jwt', alg: 'ES256' })}.${b64({})}.sig`;
    await expect(validate(proof)).rejects.toThrow('must contain a jwk');
  });

  it('rejects a symmetric jwk', async () => {
    const proof = `${b64({ typ: 'dpop+jwt', alg: 'ES256', jwk: { kty: 'oct', k: 'AA' } })}.${b64(
      {},
    )}.sig`;
    await expect(validate(proof)).rejects.toThrow('symmetric');
  });

  it('rejects a jwk with private components', async () => {
    const jwk = { ...publicJwk, d: 'AA' };
    await expect(validate(await makeProof({ header: { jwk } }))).rejects.toThrow('private key');
  });

  it('rejects a proof signed by a key other than the embedded jwk', async () => {
    const other = await generateKeyPair('ES256');
    await expect(validate(await makeProof({ key: other.privateKey }))).rejects.toThrow(
      'signature verification failed',
    );
  });

  it('rejects a non-JSON payload', async () => {
    const proof = await new CompactSign(new TextEncoder().encode('not json'))
      .setProtectedHeader({ typ: 'dpop+jwt', alg: 'ES256', jwk: publicJwk })
      .sign(privateKey);
    await expect(validate(proof)).rejects.toThrow('payload is not valid JSON');
  });

  it.each(['jti', 'htm', 'htu'])('rejects a missing %s', async (claim) => {
    await expect(validate(await makeProof({ claims: { [claim]: undefined } }))).rejects.toThrow(
      `string ${claim} claim`,
    );
  });

  it('rejects a jti longer than 128 chars', async () => {
    const proof = await makeProof({ claims: { jti: 'j'.repeat(129) } });
    await expect(validate(proof)).rejects.toThrow('jti exceeds maximum length');
  });

  it('rejects an htm mismatch', async () => {
    await expect(validate(await makeProof({ claims: { htm: 'GET' } }))).rejects.toThrow('htm');
  });

  it.each([
    'https://other.example.com/resource',
    'https://api.example.com/other',
    'not a url',
    'urn:example:resource',
  ])('rejects htu %s', async (htu) => {
    await expect(validate(await makeProof({ claims: { htu } }))).rejects.toThrow('htu');
  });

  it.each(['https://API.example.com:443/resource', 'https://api.example.com/resource?q=1#frag'])(
    'accepts equivalent htu %s',
    async (htu) => {
      await expect(validate(await makeProof({ claims: { htu } }))).resolves.toBeUndefined();
    },
  );

  it('compares non-default ports and http', async () => {
    const htu = 'http://api.example.com:8080/resource';
    const proof = await makeProof({ claims: { htu } });
    await expect(
      validateDPoPProof(sessionToken, proof, 'POST', htu, new Map()),
    ).resolves.toBeUndefined();
    await expect(
      validateDPoPProof(sessionToken, proof, 'POST', 'http://api.example.com/resource', new Map()),
    ).rejects.toThrow('htu');
  });

  it('compares htu for non-http schemes', async () => {
    const htu = 'wss://api.example.com/resource';
    const proof = await makeProof({ claims: { htu } });
    await expect(
      validateDPoPProof(sessionToken, proof, 'POST', htu, new Map()),
    ).resolves.toBeUndefined();
  });

  it('rejects a missing iat', async () => {
    await expect(validate(await makeProof({ claims: { iat: undefined } }))).rejects.toThrow(
      'numeric iat',
    );
  });

  it.each([
    ['too old', -61],
    ['in the future', 6],
  ])('rejects an iat that is %s', async (_, offset) => {
    const iat = Math.floor(Date.now() / 1000) + offset;
    await expect(validate(await makeProof({ claims: { iat } }))).rejects.toThrow(
      'outside the acceptable window',
    );
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
    const err = await validateDPoPProof(
      sessionToken,
      proof,
      'POST',
      `${URL}?code=secret`,
      new Map(),
    ).catch((e: Error) => e);
    expect(String(err)).not.toMatch(/secret|evil|GET/);
  });

  it('rejects a missing ath', async () => {
    await expect(validate(await makeProof({ claims: { ath: undefined } }))).rejects.toThrow(
      'string ath claim',
    );
  });

  it('rejects an ath for a different token', async () => {
    await expect(validate(await makeProof({ token: 'other' }))).rejects.toThrow(
      'ath claim does not match',
    );
  });

  it('rejects a proof key that does not match cnf.jkt', async () => {
    const other = await generateKeyPair('ES256');
    const jwk = await exportJWK(other.publicKey);
    const proof = await makeProof({ header: { jwk }, key: other.privateKey });
    await expect(validate(proof)).rejects.toThrow('does not match the session cnf.jkt');
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

describe('sdk.validateDPoP', () => {
  it('rejects a replayed proof within one SDK instance', async () => {
    const sdk = createSdk({ projectId: 'project-id' });
    const proof = await makeProof();
    await expect(sdk.validateDPoP(sessionToken, proof, 'POST', URL)).resolves.toBeUndefined();
    await expect(sdk.validateDPoP(sessionToken, proof, 'POST', URL)).rejects.toThrow('replayed');
  });
});
