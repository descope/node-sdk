import fetch, { Headers, Request, Response } from 'node-fetch';

// we are replacing the default fetch due to an issue with res.clone()
// starting from NodeJs-v19.1.0 it hangs when calling it twice for the same response

/* istanbul ignore next */
// @ts-ignore
globalThis.fetch = fetch;
// @ts-ignore
globalThis.Headers = Headers;
// @ts-ignore
globalThis.Request = Request;
// @ts-ignore
globalThis.Response = Response;
