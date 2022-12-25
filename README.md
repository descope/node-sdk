# Descope SDK for Node.js

The Descope SDK for Node.js provides convenient access to the Descope user management and authentication API
for a backend written in Node.js. You can read more on the [Descope Website](https://descope.com).

## Requirements

The SDK supports Node version 14 and above.

## Installing the SDK

Install the package with:

```bash
npm i --save @descope/node-sdk
```

## Setup

A Descope `Project ID` is required to initialize the SDK. Find it on the
[project page in the Descope Console](https://app.descope.com/settings/project).

```typescript
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({ projectId: 'my-project-ID' });
```

## Usage

Here are some examples how to manage and authenticate users:

### OTP Authentication

Send a user a one-time password (OTP) using your preferred delivery method (_email / SMS_). An email address or phone number must be provided accordingly.

The user can either `sign up`, `sign in` or `sign up or in`

```typescript
// Every user must have an identifier. All other user information is optional
const identifier = 'desmond@descope.com';
const user = {
  name: 'Desmond Copland',
  phone: '212-555-1234',
  email: identifier,
};
await descopeClient.otp.signUp['email'](identifier, user);
```

The user will receive a code using the selected delivery method. Verify that code using:

```typescript
const jwtResponse = await descopeClient.otp.verify['email'](identifier, 'code');
// jwtResponse.data.sessionJwt
// jwtResponse.data.refreshJwt
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### Magic Link

Send a user a Magic Link using your preferred delivery method (_email / SMS_).
The Magic Link will redirect the user to page where the its token needs to be verified.
This redirection can be configured in code, or globally in the [Descope Console](https://app.descope.com/settings/authentication/magiclink)

The user can either `sign up`, `sign in` or `sign up or in`

```typescript
// If configured globally, the redirect URI is optional. If provided however, it will be used
// instead of any global configuration
const URI = 'http://myapp.com/verify-magic-link';
await descopeClient.magicLink.signUpOrIn['email']('desmond@descope.com', URI);
```

To verify a magic link, your redirect page must call the validation function on the token (`t`) parameter (`https://your-redirect-address.com/verify?t=<token>`):

```typescript
const jwtResponse = await descopeClient.magicLink.verify('token');
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### Enchanted Link

Using the Enchanted Link APIs enables users to sign in by clicking a link
delivered to their email address. The email will include 3 different links,
and the user will have to click the right one, based on the 2-digit number that is
displayed when initiating the authentication process.

This method is similar to [Magic Link](#magic-link) but differs in two major ways:

- The user must choose the correct link out of the three, instead of having just one
  single link.
- This supports cross-device clicking, meaning the user can try to log in on one device,
  like a computer, while clicking the link on another device, for instance a mobile phone.

The Enchanted Link will redirect the user to page where the its token needs to be verified.
This redirection can be configured in code per request, or set globally in the [Descope Console](https://app.descope.com/settings/authentication/enchantedlink).

The user can either `sign up`, `sign in` or `sign up or in`

```typescript
// If configured globally, the redirect URI is optional. If provided however, it will be used
// instead of any global configuration.
const URI = 'http://myapp.com/verify-enchanted-link';
const enchantedLinkRes = await descopeClient.enchantedLink.signIn('desmond@descope.com', URI);
enchantedLinkRes.data.linkId; // Should be displayed to the user so they can click the corresponding link in the email
enchantedLinkRes.data.pendingRef; // Used to poll for a valid session
```

After sending the link, you must poll to receive a valid session using the `pendingRef` from
the previous step. A valid session will be returned only after the user clicks the right link.

```typescript
// Poll for a certain number of tries / time frame. You can control the polling interval and time frame
// with the optional WaitForSessionConfig
const jwtResponse = await descopeClient.enchantedLink.waitForSession(
  enchantedLinkRes.data.pendingRef,
);
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

To verify an enchanted link, your redirect page must call the validation function on the token (`t`) parameter (`https://your-redirect-address.com/verify?t=<token>`). Once the token is verified, the session polling will receive a valid response.

```typescript
try {
   await descopeClient.enchantedLink.verify('token');
    // token is invalid
} catch (error) {
    // token is valid
}
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### OAuth

Users can authenticate using their social logins, via the OAuth protocol. Configure your OAuth settings on the [Descope console](https://app.descope.com/settings/authentication/social). To start an OAuth flow call:

```typescript
// Choose an oauth provider out of the supported providers
// If configured globally, the return URL is optional. If provided however, it will be used
// instead of any global configuration.

const urlRes = await descopeClient.oauth.start['google'](redirectUrl);
urlRes.data.url; // Redirect the user to the returned URL to start the OAuth redirect chain
```

The user will authenticate with the authentication provider, and will be redirected back to the redirect URL, with an appended `code` HTTP URL parameter. Exchange it to validate the user:

```typescript
const jwtResponse = await descopeClient.oauth.exchange('token');
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### SSO/SAML

Users can authenticate to a specific tenant using SAML or Single Sign On. Configure your SSO/SAML settings on the [Descope console](https://app.descope.com/settings/authentication/sso). To start a flow call:

```typescript
// If configured globally, the return URL is optional. If provided however, it will be used
// instead of any global configuration.
const redirectUrl = 'https://my-app.com/handle-saml';
const urlRes = await descopeClient.saml.start('tenant'); // Choose which tenant to log into. An email can also be provided here and the domain will be extracted from it
urlRes.data.url; // Redirect the user to the given returned URL to start the SSO/SAML redirect chain
```

The user will authenticate with the authentication provider configured for that tenant, and will be redirected back to the redirect URL, with an appended `code` HTTP URL parameter. Exchange it to validate the user:

```typescript
const jwtResponse = await descopeClient.saml.exchange('token');
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### TOTP Authentication

The user can authenticate using an authenticator app, such as Google Authenticator.
Sign up like you would using any other authentication method. The sign up response
will then contain a QR code `image` that can be displayed to the user to scan using
their mobile device camera app, or the user can enter the `key` manually or click
on the link provided by the `provisioningURL`.

Existing users can add TOTP using the `update` function.

```typescript
// Every user must have an identifier. All other user information is optional
const identifier = 'desmond@descope.com';
const user = {
  name: 'Desmond Copland',
  phone: '212-555-1234',
  email: identifier,
};
const totpRes = await descopeClient.totp.signUp(identifier, user);
// Use one of the provided options to have the user add their credentials to the authenticator
totpRes.data.provisioningURL;
totpRes.data.image;
totpRes.data.key;
```

There are 3 different ways to allow the user to save their credentials in
their authenticator app - either by clicking the provisioning URL, scanning the QR
image or inserting the key manually. After that, signing in is done using the code
the app produces.

```typescript
const jwtResponse = await descopeClient.totp.verify(identifier, 'code');
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### Session Validation

Every secure request performed between your client and server needs to be validated. The client sends
the session and refresh tokens with every request, and they are validated using:

```typescript
// The response will contain all token information including the raw JWT, parsed JWT and cookies
const authInfo = await descopeClient.validateSession('sessionToken', 'refreshToken');
```

These function will validate the session and also refresh it in the event it has expired.
It returns the given session token if it's still valid, or a new one if it was refreshed.
Make sure to return the session token from the response to the client if tokens are validated directly.

The `refreshToken` is optional here to validate a session, but is required to refresh the session in the event it has expired.

Usually, the tokens can be passed in and out via HTTP headers or via a cookie.
The implementation can defer according to your implementation. See our [examples](#code-examples) for a few examples.

If Roles & Permissions are used, validate them immediately after validating the session. See the [next section](#roles--permission-validation)
for more information.

#### Session Validation Using Middleware

Alternatively, you can create a simple middleware function that internally uses the ValidateSessions function.
This middleware will automatically detect the cookies from the request and save the current user ID in the context for further usage.
On failure, it will respond with `401 Unauthorized`.

```typescript
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cookies = parseCookies(req);
    const out = await clientAuth.auth.validateSession(
      cookies[DescopeClient.SessionTokenCookieName],
      cookies[DescopeClient.RefreshTokenCookieName],
    );
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
```

### Roles & Permission Validation

When using Roles & Permission, it's important to validate the user has the required
authorization immediately after making sure the session is valid. Taking the `AuthenticationInfo`
received by the [session validation](#session-validation), call the following functions:

For multi-tenant uses:

```typescript
// You can validate specific permissions
const validTenantPermissions = await descopeClient.validateTenantPermissions(
  authInfo,
  'my-tenant-ID',
  ['Permission to validate'],
);
if (!validTenantPermissions) {
  // Deny access
}

// Or validate roles directly
const validTenantRoles = await descopeClient.validateTenantRoles(authInfo, 'my-tenant-ID', [
  'Role to validate',
]);
if (!validTenantRoles) {
  // Deny access
}
```

When not using tenants use:

```typescript
// You can validate specific permissions
const validPermissions = await descopeClient.validatePermissions(authInfo, [
  'Permission to validate',
]);
if (!validPermissions) {
  // Deny access
}

// Or validate roles directly
const validRoles = await descopeClient.validateRoles(authInfo, ['Role to validate']);
if (!validRoles) {
  // Deny access
}
```

## Management API

It is very common for some form of management or automation to be required. These can be performed
using the management API. Please note that these actions are more sensitive as they are administrative
in nature. Please use responsibly.

### Setup

To use the management API you'll need a `Management Key` along with your `Project ID`.
Create one in the [Descope Console](https://app.descope.com/settings/company/managementkeys).

```typescript
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({
  projectId: 'my-project-ID',
  managementKey: 'management-key',
});
```

### Manage Tenants

You can create, update, delete or load tenants:

```typescript
// The self provisioning domains or optional. If given they'll be used to associate
// Users logging in to this tenant
await descopeClient.management.tenant.create('My Tenant', ['domain.com']);

// You can optionally set your own ID when creating a tenant
await descopeClient.management.tenant.createWithId('my-custom-id', 'My Tenant', ['domain.com']);

// Update will override all fields as is. Use carefully.
await descopeClient.management.tenant.update('my-custom-id', 'My Tenant', [
  'domain.com',
  'another-domain.com',
]);

// Tenant deletion cannot be undone. Use carefully.
await descopeClient.management.tenant.delete('my-custom-id');

// Load all tenants
const tenantsRes = await descopeClient.management.tenant.loadAll();
tenantsRes.data.forEach((tenant) => {
  // do something
});
```

### Manage Users

You can create, update, delete or load users, as well as search according to filters:

```typescript
// A user must have an identifier, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
await descopeClient.management.user.create(
  'desmond@descope.com',
  'desmond@descope.com',
  null,
  'Desmond Copeland',
  null,
  [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
);

// Update will override all fields as is. Use carefully.
await descopeClient.management.user.update(
  'desmond@descope.com',
  'desmond@descope.com',
  null,
  'Desmond Copeland',
  null,
  [{ tenantId: 'tenant-ID1', roleNames: ['role-name1', 'role-name2'] }],
);

// Tenant deletion cannot be undone. Use carefully.
await descopeClient.management.user.delete('desmond@descope.com');

// Load specific user
const userRes = await descopeClient.management.user.load('desmond@descope.com');

// Search all users, optionally according to tenant and/or role filter
const usersRes = await descopeClient.management.user.searchAll(['tenant-ID']);
usersRes.data.forEach((user) => {
  // do something
});
```

### Manage Permissions

You can create, update, delete or load permissions:

```typescript
// You can optionally set a description for a permission.
const name = 'My Permission';
let description = 'Optional description to briefly explain what this permission allows.';
await descopeClient.management.permission.create(name, description);

// Update will override all fields as is. Use carefully.
const newName = 'My Updated Permission';
description = 'A revised description';
await descopeClient.management.permission.update(name, newName, description);

// Permission deletion cannot be undone. Use carefully.
await descopeClient.management.permission.delete(newName);

// Load all permissions
const permissionsRes = await descopeClient.management.permission.loadAll();
permissionsRes.data.forEach((permission) => {
  // do something
});
```

### Manage Roles

You can create, update, delete or load roles:

```typescript
// You can optionally set a description and associated permission for a roles.
const name = 'My Role';
let description = 'Optional description to briefly explain what this role allows.';
const permissionNames = ['My Updated Permission'];
descopeClient.management.role.create(name, description, permissionNames);

// Update will override all fields as is. Use carefully.
const newName = 'My Updated Role';
description = 'A revised description';
permissionNames.push('Another Permission');
descopeClient.management.role.update(name, newName, description, permissionNames);

// Role deletion cannot be undone. Use carefully.
descopeClient.management.role.delete(newName);

// Load all roles
const rolesRes = await descopeClient.management.role.loadAll();
rolesRes.data.forEach((role) => {
  // do something
});
```

### Manage JWTs

You can add custom claims to a valid JWT.

```typescript
const updatedJWTRes = await descopeClient.management.jwt.update('original-jwt', {
  customKey1: 'custom-value1',
  customKey2: 'custom-value2',
});
```

## Code Examples

You can find various usage examples in the [examples folder](https://github.com/descope/node-sdk/blob/main/examples).

### Setup

To run the examples, set your `Project ID` by setting the `DESCOPE_PROJECT_ID` env var or directly
in the sample code.
Find your Project ID in the [Descope console](https://app.descope.com/settings/project).

```bash
export DESCOPE_PROJECT_ID=<ProjectID>
```

### Run an example

Run the following commands in the root of the project to build and run the examples with a local build
of the SDK.

1. Run this to start the ES6 typescript module example

   ```bash
   npm i && \
   npm run build && \
   cd examples/es6 && \
   npm i && \
   npm run generateCerts && \
   npm start
   ```

2. Run this to start the commonjs example

   ```bash
   npm i && \
   npm run build && \
   cd examples/commonjs && \
   npm i && \
   npm run generateCerts && \
   npm start
   ```

## Learn More

To learn more please see the [Descope Documentation and API reference page](https://docs.descope.com/).

## Contact Us

If you need help you can email [Descope Support](mailto:support@descope.com)

## License

The Descope SDK for Node.js is licensed for use under the terms and conditions of the [MIT license Agreement](https://github.com/descope/node-sdk/blob/main/LICENSE).
