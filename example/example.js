import express from 'express';
import { DescopeClient, DeliveryMethod, OAuthProvider } from '@descope/node-sdk';
import * as fs from 'fs';
import * as https from 'https';

const app = express();
const port = 443;
const clientAuth = new DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID });
var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
};

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.Auth.ValidateSession(cookies['DS'], cookies['DSR']);
    if (out?.cookies) {
      res.set('Set-Cookie', out.cookies);
    }
    next();
  } catch (e) {
    console.log(e);
    res.status(401).json({
      error: new Error('Unauthorized!'),
    });
  }
};

app.get('/signup', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignUpOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/signin', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignInOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/verify', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  const code = req.query.code;
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

app.get('/oauth', async (req, res) => {
  const provider = req.query.provider || OAuthProvider.facebook;
  try {
    const url = await clientAuth.Auth.StartOAuth(provider);
    res.redirect(url);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/private', authMiddleware, (_, res) => {
  res.sendStatus(200);
});

app.get('/logout', authMiddleware, async (_, res) => {
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

const getMethodAndIdentifier = (req) => {
  if (req.query?.email) {
    return { identifier: req.query.email, deliveryMethod: DeliveryMethod.email };
  }
  if (req.query?.sms) {
    return { identifier: req.query.sms, deliveryMethod: DeliveryMethod.SMS };
  }
  if (req.query?.whatsapp) {
    return { identifier: req.query.whatsapp, deliveryMethod: DeliveryMethod.whatsapp };
  }
  return { identifier: '', deliveryMethod: DeliveryMethod.email };
};

const parseCookies = (request) => {
  const list = {};
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
