import express from "express";
import { Auth, DeliveryMethod } from "node-sdk";
import * as fs from "fs";
import * as https from "https";

const app = express();
const port = 443;
const clientAuth = new Auth({ projectId: "29baJuFptcamVqql1QyVVV36ANs" });
var options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/signin", async (req, res) => {
  const identifier = req.query.email || req.query.sms || req.query.whatsapp;
  await clientAuth.SignInOTP({ method: DeliveryMethod.email, identifier });
  res.sendStatus(200);
});

app.get("/verify", async (req, res) => {
  const identifier = req.query.email || req.query.sms || req.query.whatsapp;
  const code = req.query.code;
  const httpRes = await clientAuth.VerifyCode({ method: DeliveryMethod.email, identifier, code });
  httpRes.response.headers.forEach((value, key) => {
    res.set(key, value)
  })
  res.sendStatus(200);
});

app.get("/signup", (req, res) => {
  const identifier = req.query.email || req.query.sms || req.query.whatsapp;
  clientAuth.SignUpOTP({ method: DeliveryMethod.email, identifier });
  res.sendStatus(200);
});

const test = async (req, res, next) => {
  try {
    const cookies = parseCookies(req)
    await clientAuth.ValidateSession(cookies["DS"], cookies["DSR"])
    next();
  } catch (e) {
    console.log(e)
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};

app.get("/health", test, (req, res) => {
  const identifier = req.query.email || req.query.sms || req.query.whatsapp;
  clientAuth.SignUpOTP({ method: DeliveryMethod.email, identifier });
  res.sendStatus(200);
});

https.createServer(options, app).listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


const parseCookies = (request) => {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function(cookie) {
      let [ name, ...rest] = cookie.split(`=`);
      name = name?.trim();
      if (!name) return;
      const value = rest.join(`=`).trim();
      if (!value) return;
      list[name] = decodeURIComponent(value);
  });

  return list;
}