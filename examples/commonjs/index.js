const express = require('express');
const fs = require('fs');
const https = require('https');
const DescopeClient = require('@descope/node-sdk');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const port = 443;
const clientAuth = DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID, logger: console });
var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt'),
};

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.validateAndRefreshSession(
      cookies[DescopeClient.SessionTokenCookieName],
      cookies[DescopeClient.RefreshTokenCookieName],
    );
    if (out && out.cookies) {
      res.set('Set-Cookie', out.cookies);
    }
    next();
  } catch (e) {
    res.status(401).json({
      error: new Error('Unauthorized!'),
    });
  }
};

const returnOK = (res, out) => {
  res.setHeader('Content-Type', 'application/json');
  if (!out.ok) {
    res.status(400).send(out.error);
  } else if (out.data) {
    res.status(200).send(out.data);
  } else {
    res.sendStatus(200);
  }
};

const setCookies = (res, out) => {
  if (out && out.ok && out.data && out.data.cookies) {
    res.set('Set-Cookie', out.data.cookies);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(out.data);
  } else {
    res.sendStatus(401);
  }
};

app.post('/otp/signup', async (req, res) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.otp.signUp[deliveryMethod](loginId);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/otp/signin', async (req, res) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.otp.signIn[deliveryMethod](loginId);
    returnOK(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/otp/verify', async (req, res) => {
  const { loginId, deliveryMethod } = getMethodAndLoginId(req);
  const code = req.body.code;
  try {
    const out = await clientAuth.otp.verify[deliveryMethod](loginId, code);
    setCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/totp/signup', async (req, res) => {
  const { loginId } = getMethodAndLoginId(req);
  try {
    const out = await clientAuth.totp.signUp(loginId);
    var img = Buffer.from(out.data.image, 'base64');
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

app.post('/totp/verify', async (req, res) => {
  const { loginId } = getMethodAndLoginId(req);
  const code = req.body.code;
  try {
    const out = await clientAuth.totp.verify(loginId, code);
    setCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.use('/webauthn', express.static('../demo.html'));

app.post('/webauthn/signup/start', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signUp.start(
      req.body.loginId,
      req.query.origin,
      req.body.displayName,
    );
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signup/finish', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signUp.finish(
      req.body.transactionId,
      req.body.response,
    );
    setCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signin/start', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signIn.start(req.query.id, req.query.origin);
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/signin/finish', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signIn.finish(
      req.body.transactionId,
      req.body.response,
    );
    setCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/add/start', authMiddleware, async (req, res) => {
  try {
    const cookies = parseCookies(req);
    const credentials = await clientAuth.webauthn.update.start(
      req.query.id,
      req.query.origin,
      cookies[DescopeClient.RefreshTokenCookieName],
    );
    returnOK(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/webauthn/add/finish', authMiddleware, async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.update.finish(
      req.body.transactionId,
      req.body.response,
    );
    setCookies(res, credentials);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.post('/oauth', async (req, res) => {
  const provider = req.body.provider;
  try {
    const out = await clientAuth.oauth.start[provider](`https://localhost:${port}/oauth/finish`);
    res.status(200).send(out.data.url);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.get('/oauth/finish', async (req, res) => {
  const code = req.query.code;
  try {
    const out = await clientAuth.oauth.exchange(code);
    setCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
app.post('/api/private', authMiddleware, (_unused, res) => {
  res.sendStatus(200);
});

app.post('/logout', authMiddleware, async (_unused, res) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.logout(cookies['DS'], cookies['DSR']);
    setCookies(res, out);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const getMethodAndLoginId = (req) => {
  if (req.body.email) {
    return { loginId: req.body.email, deliveryMethod: DescopeClient.DeliveryMethods.email };
  }
  if (req.body.sms) {
    return { loginId: req.body.sms, deliveryMethod: DescopeClient.DeliveryMethods.SMS };
  }
  if (req.body.voice) {
    return { loginId: req.body.voice, deliveryMethod: DescopeClient.DeliveryMethods.voice };
  }
  if (req.body.whatsapp) {
    return {
      loginId: req.body.whatsapp,
      deliveryMethod: DescopeClient.DeliveryMethods.whatsapp,
    };
  }
  return { loginId: '', deliveryMethod: DescopeClient.DeliveryMethods.email };
};

const parseCookies = (request) => {
  const list = {};
  const cookieHeader = request.headers && request.headers.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = (name || '').trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
};
