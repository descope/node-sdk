const express = require('express');
const fs = require('fs');
const https = require('https');
const DescopeClient = require('@descope/node-sdk')

const app = express();
const port = 443;
const clientAuth = new DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID });
var options = {
  key: fs.readFileSync('../../server.key'),
  cert: fs.readFileSync('../../server.crt'),
};

const authMiddleware = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.validateSession(cookies['DS'], cookies['DSR']);
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

app.post('/otp/signup', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    await clientAuth.auth.otp.signUp[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/signin', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    await clientAuth.auth.otp.signIn[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/verify', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  const code = req.body.code
  try {
    const out = await clientAuth.otp.verify[deliveryMethod](identifier, code)
    if (out.data.cookies) {
      res.set('Set-Cookie', out.data.cookies)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/totp/signup', async (req, res) => {
  const { identifier } = getMethodAndIdentifier(req)
  try {
    const out = await clientAuth.totp.signUp(identifier)
    var img = Buffer.from(out.data.image, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/totp/verify', async (req, res) => {
  const { identifier } = getMethodAndIdentifier(req)
  const code = req.body.code
  try {
    const out = await clientAuth.totp.verify(identifier, code)
    if (out.data?.cookies) {
      res.set('Set-Cookie', out.data.cookies)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.use('/webauthn', express.static('../demo.html'))

app.post('/webauthn/signup/start', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signUp.start(req.body.externalID, req.query.origin, req.body.displayName);
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signup/finish', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signUp.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signin/start', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signIn.start(req.query.id, req.query.origin);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signin/finish', async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.signIn.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/add/start', authMiddleware, async (req, res) => {
  try {
    const cookies = parseCookies(req)
    const credentials = await clientAuth.webauthn.add.start(req.query.id, req.query.origin, cookies['DSR']);
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/add/finish', authMiddleware, async (req, res) => {
  try {
    const credentials = await clientAuth.webauthn.add.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/oauth', async (req, res) => {
  const provider = req.body.provider
  try {
    const out = await clientAuth.oauth.start[provider](`https://localhost:${port}/oauth/finish`)
    res.status(200).send(out.data.url)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

app.get('/oauth/finish', async (req, res) => {
  const code = req.query.code
  try {
    const out = await clientAuth.oauth.exchange(code)
    if (out.data.cookies) {
      res.set('Set-Cookie', out.data.cookies)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})
app.post('/api/private', authMiddleware, (_unused, res) => {
  res.sendStatus(200);
});

app.post('/logout', authMiddleware, async (_unused, res) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.logout(cookies['DS'], cookies['DSR']);
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
  if (req.query.email) {
    return { identifier: req.query.email, deliveryMethod: DeliveryMethod.email };
  }
  if (req.query.sms) {
    return { identifier: req.query.sms, deliveryMethod: DeliveryMethod.SMS };
  }
  if (req.query.whatsapp) {
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
