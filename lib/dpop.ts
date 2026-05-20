import { createHash } from 'crypto';
import { calculateJwkThumbprint, compactVerify, importJWK } from 'jose';

/** Allowed DPoP proof signing algorithms per RFC 9449 */
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

/** Maximum DPoP proof JWT size in bytes */
const MAX_PROOF_LEN = 8192;

/** Backward clock skew tolerance in seconds */
const IAT_BACKWARD_WINDOW = 60;

/** Forward clock skew tolerance in seconds */
const IAT_FORWARD_WINDOW = 5;

/**
 * Extract the DPoP JWK thumbprint from token claims.
 * Returns an empty string if the token is not DPoP-bound.
 */
export function getDPoPThumbprint(claims: Record<string, unknown>): string {
  const cnf = claims?.cnf as Record<string, unknown> | undefined;
  return (cnf?.jkt as string) || '';
}

/**
 * Normalize a URL for DPoP `htu` comparison per RFC 9449 §4.2:
 * - Lowercase scheme and host
 * - Strip default ports (443 for https, 80 for http)
 * - Strip query string and fragment
 */
function normalizeHtu(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return '';
  }
  const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();
  const host = parsed.hostname.toLowerCase();
  const port = parsed.port;
  const defaultPort = scheme === 'https' ? '443' : scheme === 'http' ? '80' : '';

  const portStr = port && port !== defaultPort ? `:${port}` : '';
  return `${scheme}://${host}${portStr}${parsed.pathname}`;
}

/**
 * Base64url-encode a buffer without padding characters.
 */
function base64urlNoPad(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Validate a DPoP proof JWT against the provided session token, HTTP method, and request URL.
 *
 * @param sessionToken - The validated session JWT string (used for `ath` claim verification)
 * @param dpopProof - The value of the `DPoP` HTTP header from the incoming request
 * @param method - HTTP method of the request, uppercase (e.g. "GET", "POST")
 * @param requestUrl - Absolute URL of the request (e.g. "https://api.example.com/resource")
 *
 * @throws Error if DPoP validation fails for any reason
 * @returns void — resolves successfully if the proof is valid, or is a no-op when the session
 *   token has no `cnf.jkt` claim (i.e. is not DPoP-bound)
 */
export async function validateDPoPProof(
  sessionToken: string,
  dpopProof: string | undefined,
  method: string,
  requestUrl: string,
): Promise<void> {
  // Decode the session JWT claims to check for cnf.jkt (no signature verification needed here —
  // the caller has already validated the session token via validateSession).
  const parts = sessionToken.split('.');
  if (parts.length < 2) return;
  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return;
  }

  const storedJKT = getDPoPThumbprint(claims);
  if (!storedJKT) {
    // Token is not DPoP-bound — nothing to validate
    return;
  }

  // --- From here on, the token IS DPoP-bound. Proof is required. ---

  const proof = (dpopProof ?? '').trim();

  if (proof.length > MAX_PROOF_LEN) {
    throw new Error('DPoP proof exceeds maximum length');
  }

  if (!proof) {
    throw new Error(
      'DPoP proof required: access token is DPoP-bound (cnf.jkt present)',
    );
  }

  // Step 4-5: Parse protected header (first part of JWS compact serialization)
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

  // Step 6: typ must be "dpop+jwt"
  if (header.typ !== 'dpop+jwt') {
    throw new Error(`DPoP proof header typ must be "dpop+jwt", got "${header.typ}"`);
  }

  // Step 7: alg must be in ALLOWED_ALGS
  const alg = header.alg as string;
  if (!alg || !ALLOWED_ALGS.has(alg)) {
    throw new Error(`DPoP proof algorithm "${alg}" is not allowed`);
  }

  // Step 8: extract embedded JWK
  const jwk = header.jwk as Record<string, unknown>;
  if (!jwk || typeof jwk !== 'object') {
    throw new Error('DPoP proof header must contain a jwk claim');
  }

  // Step 9: no symmetric keys
  if (jwk.kty === 'oct') {
    throw new Error('DPoP proof JWK must not use symmetric key type (oct)');
  }

  // Step 10: no private key components
  if ('d' in jwk) {
    throw new Error('DPoP proof JWK must not contain private key components');
  }

  // Step 11: verify JWS signature using the embedded JWK
  let payloadBytes: Uint8Array;
  try {
    const cryptoKey = await importJWK(jwk as Parameters<typeof importJWK>[0], alg);
    const result = await compactVerify(proof, cryptoKey);
    payloadBytes = result.payload;
  } catch (err) {
    throw new Error(`DPoP proof signature verification failed: ${err}`);
  }

  // Step 12: parse JWT payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(Buffer.from(payloadBytes).toString('utf8'));
  } catch {
    throw new Error('DPoP proof payload is not valid JSON');
  }

  // Steps 13-15: required string claims
  if (!payload.jti || typeof payload.jti !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string jti claim');
  }
  if (!payload.htm || typeof payload.htm !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string htm claim');
  }
  if (!payload.htu || typeof payload.htu !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string htu claim');
  }

  // Step 16: htm must match the HTTP method
  if (payload.htm !== method) {
    throw new Error(
      `DPoP proof htm "${payload.htm}" does not match request method "${method}"`,
    );
  }

  // Step 17: htu must match the request URL (scheme+host+path, ignore query/fragment)
  const normalizedHtu = normalizeHtu(payload.htu as string);
  const normalizedUrl = normalizeHtu(requestUrl);
  if (!normalizedHtu || !normalizedUrl || normalizedHtu !== normalizedUrl) {
    throw new Error(
      `DPoP proof htu "${payload.htu}" does not match request URL "${requestUrl}"`,
    );
  }

  // Steps 18-21: iat window check (no exp in DPoP proofs)
  const iat = payload.iat;
  if (typeof iat !== 'number') {
    throw new Error('DPoP proof payload must contain a numeric iat claim');
  }
  const now = Date.now() / 1000;
  const diff = now - iat;
  if (diff <= -IAT_FORWARD_WINDOW || diff >= IAT_BACKWARD_WINDOW) {
    throw new Error(
      `DPoP proof iat is outside the acceptable window (diff=${diff.toFixed(2)}s)`,
    );
  }

  // Steps 22-24: ath claim — sha256(sessionToken) as base64url without padding
  const ath = payload.ath;
  if (!ath || typeof ath !== 'string') {
    throw new Error('DPoP proof payload must contain a non-empty string ath claim');
  }
  const expectedAth = base64urlNoPad(
    createHash('sha256').update(sessionToken).digest(),
  );
  if (ath !== expectedAth) {
    throw new Error('DPoP proof ath claim does not match the session token hash');
  }

  // Steps 25-26: JWK thumbprint must match cnf.jkt in the session token
  let thumbprint: string;
  try {
    thumbprint = await calculateJwkThumbprint(
      jwk as Parameters<typeof calculateJwkThumbprint>[0],
      'sha256',
    );
  } catch (err) {
    throw new Error(`Failed to compute DPoP JWK thumbprint: ${err}`);
  }

  if (thumbprint !== storedJKT) {
    throw new Error(
      `DPoP proof JWK thumbprint "${thumbprint}" does not match session cnf.jkt "${storedJKT}"`,
    );
  }
}
