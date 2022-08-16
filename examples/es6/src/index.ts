import express, { Request, Response, NextFunction } from 'express'
import DescopeClient from '@descope/node-sdk'
import type { DeliveryMethod, OAuthProvider } from '@descope/node-sdk'
import * as fs from 'fs'
import * as https from 'https'
import path from 'path';
import process from 'process';
import bodyParser from 'body-parser';

const app = express()
app.use(bodyParser.json())
const port = 443

const options = {
  key: fs.readFileSync(path.resolve('./server.key')),
  cert: fs.readFileSync(path.resolve('./server.crt')),
}

const clientAuth = {
  auth: DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID || '', baseUrl: process.env.DESCOPE_API_BASE_URL, logger: console }),
}

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = parseCookies(req)
    const out = await clientAuth.auth.validateSession(cookies['DS'], cookies['DSR'])
    if (out?.cookies) {
      res.set('Set-Cookie', out.cookies)
    }
    next()
  } catch (e) {
    res.status(401).json({
      error: new Error('Unauthorized!'),
    })
  }
}

app.post('/otp/signup', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    await clientAuth.auth.otp.signUp[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/signin', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    const data = await clientAuth.auth.otp.signIn[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/verify', async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  const code = req.body.code as string
  try {
    const out = await clientAuth.auth.otp.verify[deliveryMethod](identifier, code)
    if (out.data.cookies) {
      res.set('Set-Cookie', out.data.cookies)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/totp/signup', async (req: Request, res: Response) => {
  const { identifier } = getMethodAndIdentifier(req)
  try {
    const out = await clientAuth.auth.totp.signUp(identifier)
    var img = Buffer.from(out.data?.image, 'base64');
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

app.post('/totp/verify', async (req: Request, res: Response) => {
  const { identifier } = getMethodAndIdentifier(req)
  const code = req.body.code as string
  try {
    const out = await clientAuth.auth.totp.verify(identifier, code)
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

app.post('/webauthn/signup/start', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signUp.start(req.body.externalID, req.query.origin as string, req.body.displayName);
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signup/finish', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signUp.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signin/start', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signIn.start(req.query.id as string, req.query.origin as string);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/signin/finish', async (req: Request, res: Response) => {
  try {
    const credentials = await clientAuth.auth.webauthn.signIn.finish(req.body.transactionId, req.body.response);
    if (credentials.data?.cookies) {
      res.set('Set-Cookie', credentials.data.cookies)
    }
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/add/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req)
    const credentials = await clientAuth.auth.webauthn.add.start(req.query.id as string, req.query.origin as string, cookies['DSR']);
    res.status(200).send(credentials.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/webauthn/add/finish', authMiddleware, async (req: Request, res: Response) => {
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

app.post('/oauth', async (req: Request, res: Response) => {
  const provider: OAuthProvider = (req.body.provider as OAuthProvider)
  try {
    const out =  await clientAuth.auth.oauth.start[provider]()
    res.redirect(out.data)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

app.post('/api/private', authMiddleware, (_unused: Request, res: Response) => {
  console.log("Private API")
  res.sendStatus(200)
})

app.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req)
    const out = await clientAuth.auth.logout(cookies['DS'])
    if (out.data.cookies) {
      res.set('Set-Cookie', out.data.cookie)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const getMethodAndIdentifier = (
  req: Request,
): { identifier: string; deliveryMethod: DeliveryMethod } => {
  if (req.body.email) {
    return { identifier: req.body.email as string, deliveryMethod: 'email' }
  }
  if (req.body.sms) {
    return { identifier: req.body.sms as string, deliveryMethod: 'sms' }
  }
  if (req.body.whatsapp) {
    return { identifier: req.body.whatsapp as string, deliveryMethod: 'whatsapp' }
  }
  return { identifier: '', deliveryMethod: 'email' }
}

const parseCookies = (request: Request) => {
  const list: { [key: string]: string } = {}
  const cookieHeader = request.headers?.cookie
  if (!cookieHeader) return list

  cookieHeader.split(`;`).forEach(function (cookie: string) {
    let [name, ...rest] = cookie.split(`=`)
    name = name?.trim()
    if (!name) return
    const value = rest.join(`=`).trim()
    if (!value) return
    list[name] = decodeURIComponent(value)
  })

  return list
}
