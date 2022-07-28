import express, { Request, Response, NextFunction } from 'express'
import DescopeClient from '@descope/node-sdk'
import type { DeliveryMethod, OAuthProvider } from '@descope/node-sdk'
import * as fs from 'fs'
import * as https from 'https'
import path from 'path';
import process from 'process';
import bodyParser from "body-parser";

const app = express()
var jsonParser = bodyParser.json()

const port = 443

const options = {
  key: fs.readFileSync(path.resolve('./server.key')),
  cert: fs.readFileSync(path.resolve('./server.crt')),
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const clientAuth = {
  auth: DescopeClient({ projectId: process.env.DESCOPE_PROJECT_ID || '', logger: console, 
    baseURL: 'https://172.17.0.1:8443/v1/' }),
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

app.post('/otp/signup', jsonParser, async (req: Request, res: Response) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    await clientAuth.auth.otp.signUp[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/signin', jsonParser, async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  try {
    await clientAuth.auth.otp.signIn[deliveryMethod](identifier)
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/otp/verify', jsonParser, async (req: Request, res: Response) => {
  const { identifier, deliveryMethod } = getMethodAndIdentifier(req)
  const code = req.body.code as string
  try {
    const out = await clientAuth.auth.otp.verify[deliveryMethod](code, identifier )
    if (out.data.jwts) {
      res.set('Set-Cookie', out.data.jwts)
    }
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

app.post('/oauth', jsonParser, (req: Request, res: Response) => {
  const provider: OAuthProvider = (req.body.provider as OAuthProvider)
  try {
    const url =  clientAuth.auth.oauth.start[provider]()
    res.redirect(url)
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

app.get('/private', authMiddleware, (_unused: Request, res: Response) => {
  res.sendStatus(200)
})

app.post('/logout', jsonParser, authMiddleware, async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req)
    const out = await clientAuth.auth.logout(cookies['DS'])
    if (out.data.jwts) {
      res.set('Set-Cookie', out.data.jwts[0])
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
