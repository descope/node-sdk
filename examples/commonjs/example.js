const express = require('express');
const fs = require('fs');
const https = require('https');
const DescopeClient = require('@descope/node-sdk')

const app = express();
const port = 443;
const clientAuth = DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID });
var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt'),
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

app.get('/otp/signup', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignUpOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/otp/signin', async (req, res) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req);
  try {
    await clientAuth.Auth.SignInOTP({ identifier, deliveryMethod });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/otp/verify', async (req, res) => {
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
    const credentials = await clientAuth.auth.webauthn.add.start(req.query.id, req.query.origin, cookies['DSR']);
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/add/finish', authMiddleware, async (req, res) => {
  try {
    const credentials = await clientAuth.auth.webauthn.add.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.get('/oauth', async (req, res) => {
  const provider = req.query.provider;
  try {
    const url = await clientAuth.oauth.start(provider);
    res.redirect(url);
  } catch (error) {
    console.log(error);
    res.sendStatus(401);
  }
});

app.get('/private', authMiddleware, (_unused, res) => {
  res.sendStatus(200);
});

app.get('/logout', authMiddleware, async (_unused, res) => {
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
    return { identifier: req.query.email, deliveryMethod: DescopeClient.DeliveryMethods.email };
  }
  if (req.query.sms) {
    return { identifier: req.query.sms, deliveryMethod: DescopeClient.DeliveryMethods.SMS };
  }
  if (req.query.whatsapp) {
    return { identifier: req.query.whatsapp, deliveryMethod: DescopeClient.DeliveryMethods.whatsapp };
  }
  return { identifier: '', deliveryMethod: DescopeClient.DeliveryMethods.email };
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
