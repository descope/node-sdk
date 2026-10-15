import { createHash } from 'crypto';
import { calculateJwkThumbprint, compactVerify, importJWK } from 'jose';

const ALLOWED_ALGS = new Set([
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512',
  'EdDSA',
]);

const MAX_PROOF_LEN = 8192;

const IAT_BACKWARD_WINDOW = 60;

const IAT_FORWARD_WINDOW = 5;

const JTI_TTL_MS = 2 * IAT_BACKWARD_WINDOW * 1000;

const MAX_JTI_LEN = 128;

const MAX_JTI_ENTRIES = 100_000;

/** jti mapped to its expiry time in ms */
type DPoPJtiStore = Map<string, number>;

function burnJti(store: DPoPJtiStore, jti: string, nowMs: number): void {
  // Every entry has the same TTL, so insertion order is expiry order
  const entries = store.entries();
  for (let e = entries.next(); !e.done && e.value[1] <= nowMs; e = entries.next()) {
    store.delete(e.value[0]);
  }
  if (store.has(jti)) {
    throw new Error('DPoP proof replayed: jti already seen');
  }
  if (store.size >= MAX_JTI_ENTRIES) {
    throw new Error('DPoP replay store at capacity; proof rejected');
  }
  store.set(jti, nowMs + JTI_TTL_MS);
}

/** RFC 9449 §4.3 htu comparison form: query and fragment dropped; '' when there is no host */
function normalizeHtu(raw: string): string {
  try {
    const { protocol, host, pathname } = new URL(raw);
    return host ? `${protocol}//${host}${pathname}` : '';
  } catch {
    return '';
  }
}

/** Checks a proof against `storedJKT`, which must come from a verified token */
export async function verifyDPoPProof(
  sessionToken: string,
  dpopProof: string | undefined,
  method: string,
  requestUrl: string,
  storedJKT: string,
  jtiStore: DPoPJtiStore,
): Promise<void> {
  const nowMs = Date.now();
  const proof = (dpopProof ?? '').trim();

  if (proof.length > MAX_PROOF_LEN) {
    throw new Error('DPoP proof exceeds maximum length');
  }

  if (!proof) {
    throw new Error('DPoP proof required: access token is DPoP-bound (cnf.jkt present)');
  }

  const proofParts = proof.split('.');
  if (proofParts.length !== 3) {
    throw new Error('DPoP proof must be a compact JWS with exactly 3 parts');
  }

  let header: Record<string, unknown>;
  try {
    header = JSON.parse(Buffer.from(proofParts[0], 'base64url').toString('utf8'));
  } catch {
    throw new Error('DPoP proof header is not valid base64url-encoded JSON');
  }

  if (header.typ !== 'dpop+jwt') {
    throw new Error('DPoP proof header typ must be "dpop+jwt"');
  }

  const alg = header.alg as string;
  if (!alg || !ALLOWED_ALGS.has(alg)) {
    throw new Error('DPoP proof algorithm is not allowed');
  }

  const jwk = header.jwk as Record<string, unknown>;
  if (!jwk || typeof jwk !== 'object') {
    throw new Error('DPoP proof header must contain a jwk claim');
  }

  if (jwk.kty === 'oct') {
    throw new Error('DPoP proof JWK must not use symmetric key type (oct)');
  }

  if ('d' in jwk) {
    throw new Error('DPoP proof JWK must not contain private key components');
  }

  let payloadBytes: Uint8Array;
  try {
    const cryptoKey = await importJWK(jwk as Parameters<typeof importJWK>[0], alg);
    const result = await compactVerify(proof, cryptoKey);
    payloadBytes = result.payload;
  } catch {
    throw new Error('DPoP proof signature verification failed');
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(payloadBytes).toString('utf8'));
  } catch {
    throw new Error('DPoP proof payload is not valid JSON');
  }

  if (!payload.jti || typeof payload.jti !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string jti claim');
  }
  if (payload.jti.length > MAX_JTI_LEN) {
    throw new Error('DPoP proof jti exceeds maximum length');
  }
  if (!payload.htm || typeof payload.htm !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string htm claim');
  }
  if (!payload.htu || typeof payload.htu !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string htu claim');
  }

  if (payload.htm !== method) {
    throw new Error('DPoP proof htm does not match the request method');
  }

  const normalizedHtu = normalizeHtu(payload.htu as string);
  const normalizedUrl = normalizeHtu(requestUrl);
  if (!normalizedHtu || !normalizedUrl || normalizedHtu !== normalizedUrl) {
    throw new Error('DPoP proof htu does not match the request URL');
  }

  const { iat } = payload;
  if (typeof iat !== 'number') {
    throw new Error('DPoP proof payload must contain a numeric iat claim');
  }
  const diff = nowMs / 1000 - iat;
  if (diff <= -IAT_FORWARD_WINDOW || diff >= IAT_BACKWARD_WINDOW) {
    throw new Error('DPoP proof iat is outside the acceptable window');
  }

  const { ath } = payload;
  if (!ath || typeof ath !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string ath claim');
  }
  const expectedAth = createHash('sha256').update(sessionToken).digest('base64url');
  if (ath !== expectedAth) {
    throw new Error('DPoP proof ath claim does not match the session token hash');
  }

  const thumbprint = await calculateJwkThumbprint(
    jwk as Parameters<typeof calculateJwkThumbprint>[0],
    'sha256',
  );
  if (thumbprint !== storedJKT) {
    throw new Error('DPoP proof JWK thumbprint does not match the session cnf.jkt');
  }

  // Burn the jti only after every other check passes, so invalid proofs cannot fill the store
  burnJti(jtiStore, payload.jti, nowMs);
}

/** RFC 9449 §4.3 proof validation behind `sdk.validateDPoP`; no-op for a token without cnf.jkt */
export async function validateDPoPProof(
  sessionToken: string,
  dpopProof: string | undefined,
  method: string,
  requestUrl: string,
  jtiStore: DPoPJtiStore,
): Promise<void> {
  // The caller already verified the token's signature with validateSession. A malformed token
  // throws instead of passing as unbound.
  const parts = sessionToken.split('.');
  if (parts.length < 2) {
    throw new Error('Session token is invalid: not a valid JWT');
  }
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    throw new Error('Session token is invalid: could not decode JWT payload');
  }

  const cnf = claims?.cnf as Record<string, unknown> | undefined;
  const storedJKT = (cnf?.jkt as string) || '';
  if (!storedJKT) {
    return;
  }
  await verifyDPoPProof(sessionToken, dpopProof, method, requestUrl, storedJKT, jtiStore);
}

export type { DPoPJtiStore };
