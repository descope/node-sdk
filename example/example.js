import express from 'express';
import Auth, { DeliveryMethod } from 'node-sdk';
import * as fs from 'fs';
import * as https from 'https';

const app = express();
const port = 443;
const clientAuth = new Auth({ projectId: '29baJuFptcamVqql1QyVVV36ANs' });
var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
};

app.get('/signup', (req, res) => {
  const { identifier, method } = getMethodAndIdentifier(req);
  clientAuth.SignUpOTP({ identifier, method });
  res.sendStatus(200);
});

app.get('/signin', async (req, res) => {
  const { identifier, method } = getMethodAndIdentifier(req);
  await clientAuth.SignInOTP({ identifier, method });
  res.sendStatus(200);
});

app.get('/verify', async (req, res) => {
  const { identifier, method } = getMethodAndIdentifier(req);
  const code = req.query.code;
  const out = await clientAuth.VerifyCode({ identifier, method, code });
  if (out?.cookies) {
    res.set('Set-Cookie', out.cookies);
  }
  res.sendStatus(200);
});

app.get('/private', authMiddleware, (req, res) => {
  const { identifier, method } = getMethodAndIdentifier(req);
  clientAuth.SignUpOTP({ method, identifier });
  res.sendStatus(200);
});

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.ValidateSession(cookies['DS'], cookies['DSR']);
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

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const getMethodAndIdentifier = (req) => {
  if (req.query?.email) {
    return { identifier: req.query.email, method: DeliveryMethod.email };
  }
  if (req.query?.sms) {
    return { identifier: req.query.sms, method: DeliveryMethod.SMS };
  }
  if (req.query?.whatsapp) {
    return { identifier: req.query.whatsapp, method: DeliveryMethod.whatsapp };
  }
  return { identifier: '', method: DeliveryMethod.email };
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
