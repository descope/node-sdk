## OAuth Authentication

In the examples below, we assume using the Descope builtin OAuth provider application, in that case, we dont need to define any specific application details.
If this is not the case, you may need sign in to [Descope console](https://app.descope.com) to update selected OAuth provider(s) application details.

### Prerequisites

Replace any instance of `<ProjectID>` in the code below with your company's Project ID, which can be found in the [Descope console](https://app.descope.com).

- Run the following commands in your project

  These commands will add the Descope NodeJS SDK as a project dependency.

  ```bash
  npm i --save @descope/node-sdk
  ```

- Import and initialize the NodeJS client in your source code

  ```javascript
  import DescopeClient from '@descope/node-sdk';
  const descopeClient = DescopeClient({ projectId: <ProjectID> });
  ```

  or

  ```javascript
  const sdk = require('@descope/node-sdk');
  const descopeClient = sdk({ projectId: <ProjectID> });
  ```

### 1. Customer Sign-up/Sign-In

In your OAuth start flow (for example, `myapp.com/login-with-facebook`) generate a url to redirect the user to. In the example below we start a facebook login request and return the url the end-user need to access to authenticate.
We also use the optional redirect URL to `https://localhost:3000/exchange` to call the exchange route. You may also define this in the [Descope console](https://app.descope.com).

```javascript
const out = await descopeClient.oauth.start.facebook('https://localhost:3000/exchange');
// res.redirect(out.data.url);
return out.data.url;
```

### 1.1 Error handling

Each authentication function may return an error upon authentication failure or bad request. In case of an error, you will recieve an sdk response with `ok` equal to false and the error details are also included, such as the `errorCode` and the `errorDescription`. Needless to say, the `data` will be empty whenever an error occur.

```javascript
const out = await descopeClient.oauth.start.facebook();
if (!out.ok) {
    console.log(`an error has occured [code: ${out.errorCode}] with message: "${out.errorDescription}"`)
} else {
    ...
}
```

### 2. Customer Exchange

In your exchange for any of the OAuth provider (for example, `mydomain.com/exchange`) verify the code from the provider by using the exchange method.

```javascript
const code = req.query.code;
const out = await descopeClient.oauth.exchange(code);
if (out.data.cookies) {
  res.set('Set-Cookie', out.data.cookies);
}
```

### 3. Session Validation

Session validation checks to see that the visitor to your website or application is who they say they are, by comparing the value in the validation variables against the session data that is already stored.

```javascript
const out = await descopeClient.validateSession(session_jwt, refresh_jwt);
if (out.cookies) {
  res.set('Set-Cookie', out.cookies);
}
```
