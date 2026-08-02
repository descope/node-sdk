// Native fetch only (Node >= 18, browsers, Cloudflare Workers and other edge runtimes).
// Bundling a Node-based polyfill (cross-fetch/node-fetch) pulls `http`/`https` into edge
// builds, where unenv stubs them with functions that throw on call.
// Bound through a wrapper so undici's fetch keeps its correct `this`.
const polyfillFetch = (...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args);

export default polyfillFetch as unknown as typeof fetch;
