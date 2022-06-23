import express, { Request, Response, NextFunction } from 'express';
import { DescopeClient, DeliveryMethod, OAuthProvider } from '@descope/node-sdk';
import * as fs from 'fs';
import * as https from 'https';

const app = express();
const port = 443;
const clientAuth = new DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID || "", baseURL: 'http://localhost:8191/v1/' });
var options = {
  key: fs.readFileSync('../../server.key'),
  cert: fs.readFileSync('../../server.crt'),
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.Auth.ValidateSession(cookies['DS'], cookies['DSR']);
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

app.get('/otp/signup', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignUpOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/otp/signin', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignInOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/otp/verify', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  const code = req.query.code as string;
  try {
    const out = await clientAuth.Auth.VerifyCode({ identifier, deliveryMethod, code });
    if (out?.cookies) {
      res.set('Set-Cookie', out.cookies);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/oauth', async (req: Request, res: Response) => {
  const provider = req.query.provider as OAuthProvider || OAuthProvider.facebook;
  try {
    const url = await clientAuth.Auth.StartOAuth(provider);
    res.redirect(url);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/private', authMiddleware, (_unused: Request, res: Response) => {
  res.sendStatus(200);
});

app.get('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.Auth.Logout(cookies['DS'], cookies['DSR']);
    if (out?.cookies) {
      res.set('Set-Cookie', out.cookies);
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const getMethodAndIdentifier = (req: Request): { identifier: string, deliveryMethod: DeliveryMethod } => {
  if (req.query.email) {
    return { identifier: req.query.email as string, deliveryMethod: DeliveryMethod.email };
  }
  if (req.query.sms) {
    return { identifier: req.query.sms as string, deliveryMethod: DeliveryMethod.SMS };
  }
  if (req.query.whatsapp) {
    return { identifier: req.query.whatsapp as string, deliveryMethod: DeliveryMethod.whatsapp };
  }
  return { identifier: '', deliveryMethod: DeliveryMethod.email };
};

const parseCookies = (request: Request) => {
  const list: { [key: string]: string } = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
};
