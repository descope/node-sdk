import type { DeliveryMethod, OAuthProvider, ResponseData, SdkResponse } from '@descope/node-sdk';
import DescopeClient from '@descope/node-sdk';
import bodyParser from 'body-parser';
import express, { NextFunction, Request, Response } from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'https';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 443;

const options = {
  key: readFileSync(path.resolve('./server.key')),
  cert: readFileSync(path.resolve('./server.crt')),
};

const clientAuth = {
  auth: DescopeClient({
    projectId: process.env.DESCOPE_PROJECT_ID || '',
    baseUrl: process.env.DESCOPE_API_BASE_URL,
    logger: console,
  }),
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.auth.validateAndRefreshSession(
      cookies[DescopeClient.SessionTokenCookieName],
      cookies[DescopeClient.RefreshTokenCookieName],
    );
    if (out?.cookies) {
      res.set('Set-Cookie', out.cookies);
    }
    next();
  } catch (e) {
    res.status(401).json({
      error: new Error('Unauthorized!'),
    });
  }
};

const returnOK = (res: Response, out: SdkResponse<ResponseData>) => {
  res.setHeader('Content-Type', 'application/json');
  if (!out.ok) {
    res.status(400).send(out.error);
  } else if (out.data) {
    res.status(200).send(out.data);
  } else {
    res.sendStatus(200);
  }
};

/**
 * Generate a cookie string from given parameters
 * @param name name of the cookie
 * @param value value of cookie that must be already encoded
 * @param options any options to put on the cookie like cookieDomain, cookieMaxAge, cookiePath
 * @returns Cookie string with all options on the string
 */
const generateCookie = (name: string, value: string, options?: Record<string, string | number>) =>
  `${name}=${value}; Domain=${options?.cookieDomain || ''}; Max-Age=${
    options?.cookieMaxAge || ''
  }; Path=${options?.cookiePath || '/'}; HttpOnly; SameSite=Strict`;

const returnCookies = <T extends ResponseData>(res: Response, out: SdkResponse<T>) => {
  if (out.ok) {
    // Set cookies with
    // - Response's cookies
    // - Response's session-token (if it exists)
    // Note: Session token may grow, especially in cases of using authorization, or adding custom claims,
    // This may cause it size to pass browser cookies size limit, use carefully.
    const { cookies = [], sessionJwt = '', ...rest } = out?.data! || {};
    const setCookies = [...cookies];
    if (sessionJwt) {
      setCookies.push(generateCookie(DescopeClient.SessionTokenCookieName, sessionJwt, rest));
    }
    res.set('Set-Cookie', setCookies);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(out.data);
  } else {
    res.sendStatus(401);
  }
};

app.post('/otp/signup', async (req: Request, res: Response) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.auth.otp.signUp[deliveryMethod](loginId);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/otp/signin', async (req: Request, res: Response) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.auth.otp.signIn[deliveryMethod](loginId);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/otp/sign-up-or-in', async (req: Request, res: Response) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.auth.otp.signUpOrIn[deliveryMethod](loginId);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/otp/verify', async (req: Request, res: Response) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  const code = req.body.code as string;
  try {
    const out = await clientAuth.auth.otp.verify[deliveryMethod](loginId, code);
    returnCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/totp/signup', async (req: Request, res: Response) => {
  const { loginId } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.auth.totp.signUp(loginId);
    const img = Buffer.from(out?.data?.image!, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length,
    });
    res.end(img);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/totp/verify', async (req: Request, res: Response) => {
  const { loginId } = getMethodAndLoginId(req);
  const code = req.body.code as string;
  try {
    const out = await clientAuth.auth.totp.verify(loginId, code);
    returnCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.use('/webauthn', express.static('../demo.html'));

app.post('/webauthn/signup/start', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signUp.start(
      req.body.externalID,
      req.query.origin as string,
      req.body.displayName,
    );
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signup/finish', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signUp.finish(
      req.body.transactionId,
      req.body.response,
    );
    returnCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signin/start', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signIn.start(
      req.query.id as string,
      req.query.origin as string,
    );
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signin/finish', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signIn.finish(
      req.body.transactionId,
      req.body.response,
    );
    returnCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/add/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req);
    const credentials = await clientAuth.auth.webauthn.update.start(
      req.query.id as string,
      req.query.origin as string,
      cookies[DescopeClient.RefreshTokenCookieName],
    );
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/add/finish', authMiddleware, async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.update.finish(
      req.body.transactionId,
      req.body.response,
    );
    returnCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/oauth', async (req: Request, res: Response) => {
  const provider: OAuthProvider = req.body.provider as OAuthProvider;
  try {
    const out = await clientAuth.auth.oauth.start[provider](
      `https://localhost:${port}/oauth/finish`,
    );
    res.status(200).send(out?.data?.url);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get('/oauth/finish', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  try {
    const out = await clientAuth.auth.oauth.exchange(code);
    returnCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.post('/password/sign-up', async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body;
    const out = await clientAuth.auth.password.signUp(loginId as string, password as string);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/password/sign-in', async (req: Request, res: Response) => {
  try {
    const { loginId, password } = req.body;
    const out = await clientAuth.auth.password.signIn(loginId as string, password as string);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/password/send-reset', async (req: Request, res: Response) => {
  try {
    const { loginId } = req.body;
    const out = await clientAuth.auth.password.sendReset(loginId as string);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/password/replace', async (req: Request, res: Response) => {
  try {
    const { loginId, oldPassword, newPassword } = req.body;
    const out = await clientAuth.auth.password.replace(
      loginId as string,
      oldPassword as string,
      newPassword as string,
    );
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/password/update', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { loginId, newPassword } = req.body;
    const out = await clientAuth.auth.password.update(loginId as string, newPassword as string);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/api/public', (_unused: Request, res: Response) => {
  console.log('Public API');
  res.status(200).send({ message: 'Public API response!' });
});

app.post('/api/private', authMiddleware, (_unused: Request, res: Response) => {
  console.log('Private API');
  res.sendStatus(200);
});

app.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.auth.logout(cookies.DS);
    returnCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const getMethodAndLoginId = (req: Request): { loginId: string; deliveryMethod: DeliveryMethod } => {
  if (req.body.email) {
    return { loginId: req.body.email as string, deliveryMethod: 'email' };
  }
  if (req.body.sms) {
    return { loginId: req.body.sms as string, deliveryMethod: 'sms' };
  }
  if (req.body.whatsapp) {
    return { loginId: req.body.whatsapp as string, deliveryMethod: 'whatsapp' };
  }
  return { loginId: '', deliveryMethod: 'email' };
};

const parseCookies = (request: Request) => {
  const list: { [key: string]: string } = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach((cookie: string) => {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
};
