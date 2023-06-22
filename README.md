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

## Authentication Functions

### Setup

Before you can use authentication functions listed below, you must initialize `descopeClient` to use all of the built-in SDK functions.

You'll need your Descope `Project ID` to create this, and you can find it on the [project page](https://app.descope.com/settings/project) in the Descope Console.

```typescript
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({ projectId: 'my-project-ID' });
```

Once you've created a `descopeClient`, you can use that to work with the following functions:

1. [OTP Authentication](#otp-authentication)
2. [Magic Link](#magic-link)
3. [Enchanted Link](#enchanted-link)
4. [OAuth](#oauth)
5. [SSO/SAML](#ssosaml)
6. [TOTP Authentication](#totp-authentication)
7. [Passwords](#passwords)
8. [Session Validation](#session-validation)
9. [Roles & Permission Validation](#roles--permission-validation)
10. [Logging Out](#logging-out)

## Management Functions

### Setup

Before you can use management functions listed below, you must initialize `descopeClient`.

If you wish to also use management functions, you will need to initialize a new version of your `descopeClient`, but this time with a `ManagementKey` as well as your `Project ID`. Create a management key in the [Descope Console](https://app.descope.com/settings/company/managementkeys).

```typescript
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({
  projectId: 'my-project-ID',
  managementKey: 'management-key',
});
```

Then, you can use that to work with the following functions:

1. [Manage Tenants](#manage-tenants)
2. [Manage Users](#manage-users)
3. [Manage Access Keys](#manage-access-keys)
4. [Manage SSO Setting](#manage-sso-setting)
5. [Manage Permissions](#manage-permissions)
6. [Manage Roles](#manage-roles)
7. [Query SSO Groups](#query-sso-groups)
8. [Manage Flows](#manage-flows)
9. [Manage JWTs](#manage-jwts)
10. [Search Audit](#search-audit)

If you wish to run any of our code samples and play with them, check out our [Code Examples](#code-examples) section.

If you're performing end-to-end testing, check out the [Utils for your end to end (e2e) tests and integration tests](#utils-for-your-end-to-end-e2e-tests-and-integration-tests) section. You will need to use the `descopeClient` you created under the setup of [Management Functions](#management-functions).

---

### OTP Authentication

Send a user a one-time password (OTP) using your preferred delivery method (_email / SMS_). An email address or phone number must be provided accordingly.

The user can either `sign up`, `sign in` or `sign up or in`

```typescript
// Every user must have a login ID. All other user information is optional
const loginId = 'desmond@descope.com';
const user = {
  name: 'Desmond Copland',
  phone: '212-555-1234',
  email: loginId,
};
await descopeClient.otp.signUp['email'](loginId, user);
```

The user will receive a code using the selected delivery method. Verify that code using:

```typescript
const jwtResponse = await descopeClient.otp.verify['email'](loginId, 'code');
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
// Every user must have a login ID. All other user information is optional
const loginId = 'desmond@descope.com';
const user = {
  name: 'Desmond Copland',
  phone: '212-555-1234',
  email: loginId,
};
const totpRes = await descopeClient.totp.signUp(loginId, user);
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
const jwtResponse = await descopeClient.totp.verify(loginId, 'code');
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

### Passwords

The user can also authenticate with a password, though it's recommended to
prefer passwordless authentication methods if possible. Sign up requires the
caller to provide a valid password that meets all the requirements configured
for the [password authentication method](https://app.descope.com/settings/authentication/password) in the Descope console.

```js
// Every user must have a loginId. All other user information is optional
const loginId = 'desmond@descope.com';
const password = 'qYlvi65KaX';
const user = {
  name: 'Desmond Copeland',
  email: loginId,
};
const jwtResponse = await descopeClient.password.signUp(loginId, password, user);
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The user can later sign in using the same loginId and password.

```js
const jwtResponse = await descopeClient.password.signIn(loginId, password);
// jwtResponse.data.sessionJwt;
// jwtResponse.data.refreshJwt;
```

The session and refresh JWTs should be returned to the caller, and passed with every request in the session. Read more on [session validation](#session-validation)

In case the user needs to update their password, one of two methods are available: Resetting their password or replacing their password

**Changing Passwords**

_NOTE: sendReset will only work if the user has a validated email address. Otherwise password reset prompts cannot be sent._

In the [password authentication method](https://app.descope.com/settings/authentication/password) in the Descope console, it is possible to define which alternative authentication method can be used in order to authenticate the user, in order to reset and update their password.

```js
// Start the reset process by sending a password reset prompt. In this example we'll assume
// that magic link is configured as the reset method. The optional redirect URL is used in the
// same way as in regular magic link authentication.
const loginId = 'desmond@descope.com';
const redirectURL = 'https://myapp.com/password-reset';
const passwordResetResponse = await descopeClient.password.sendReset(loginId, redirectURL);
```

The magic link, in this case, must then be verified like any other magic link (see the [magic link section](#magic-link) for more details). However, after verifying the user, it is expected
to allow them to provide a new password instead of the old one. Since the user is now authenticated, this is possible via:

```js
// The refresh token is required to make sure the user is authenticated.
await descopeClient.password.update(loginId, newPassword, token);
```

`update()` can always be called when the user is authenticated and has a valid session.

Alternatively, it is also possible to replace an existing active password with a new one.

```js
// Replaces the user's current password with a new one
await descopeClient.password.replace(loginId, oldPassword, newPassword);
```

### Session Validation

Every secure request performed between your client and server needs to be validated. The client sends
the session and refresh tokens with every request, and they are validated using one of the following:

```typescript
// Validate the session. Will throw if expired
const authInfo = await descopeClient.validateSession('sessionToken');

// If validateSession throws an exception, you will need to refresh the session using
const authInfo = await descopeClient.refreshSession('refreshToken');

// Alternatively, you could combine the two and
// have the session validated and automatically refreshed when expired
const authInfo = await descopeClient.validateAndRefreshSession('sessionToken', 'refreshToken');
```

Choose the right session validation and refresh combination that suits your needs.
Refreshed sessions return the same response as is returned when users first sign up / log in,
containing the session and refresh tokens, as well as all of the JWT claims.
Make sure to return the session token from the response to the client if tokens are validated directly.

Usually, the tokens can be passed in and out via HTTP headers or via a cookie.
The implementation can defer according to your implementation. See our [examples](#code-examples) for a few examples.

If Roles & Permissions are used, validate them immediately after validating the session. See the [next section](#roles--permission-validation)
for more information.

#### Session Validation Using Middleware

Alternatively, you can create a simple middleware function that internally uses the `validateSession` function.
This middleware will automatically parse the cookies from the request.
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

### Logging Out

You can log out a user from an active session by providing their `refreshToken` for that session.
After calling this function, you must invalidate or remove any cookies you have created.

```typescript
await descopeClient.logout(refreshToken);
```

It is also possible to sign the user out of all the devices they are currently signed-in with. Calling `logoutAll` will
invalidate all user's refresh tokens. After calling this function, you must invalidate or remove any cookies you have created.

```typescript
await descopeClient.logoutAll(refreshToken);
```

## Management Functions

It is very common for some form of management or automation to be required. These can be performed
using the management functions. Please note that these actions are more sensitive as they are administrative
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
// A user must have a login ID, other fields are optional.
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

// Alternatively, a user can be created and invited via an email message.
// Make sure to configure the invite URL in the Descope console prior to using this function,
// and that an email address is provided in the information.
await descopeClient.management.user.invite(
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

// Update explicit data for a user rather than overriding all fields
await descopeClient.management.user.updatePhone('desmond@descope.com', '+18005551234', true);
await descopeClient.management.user.updateLoginId('desmond@descope.com', 'bane@descope.com');
await descopeClient.management.user.removeTenantRoles(
  'desmond@descope.com',
  'tenant-ID1',
  'role-name2',
);

// User deletion cannot be undone. Use carefully.
await descopeClient.management.user.delete('desmond@descope.com');

// Load specific user
const userRes = await descopeClient.management.user.load('desmond@descope.com');

// If needed, users can be loaded using the user ID as well
const userRes = await descopeClient.management.user.loadByUserId('<user-ID>');

// Search all users, optionally according to tenant and/or role filter
// Results can be paginated using the limit and page parameters
const usersRes = await descopeClient.management.user.searchAll(['tenant-ID']);
usersRes.data.forEach((user) => {
  // do something
});
```

#### Set or Expire User Password

You can set or expire a user's password.
Note: When setting a password, it will automatically be set as expired.
The user will not be able log-in using an expired password, and will be required replace it on next login.

```typescript
// Set a user's password
await descopeClient.management.user.setPassword('<login-ID>', '<some-password>');

// Or alternatively, expire a user password
await descopeClient.management.user.expirePassword('<login-ID>');
```

### Manage Access Keys

You can create, update, delete or load access keys, as well as search according to filters:

```typescript
// An access key must have a name and expiration, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
await descopeClient.management.accessKey.create(
  'key-name',
  123456789, // expiration time
  null,
  [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
);

// Load specific user
const accessKeyRes = await descopeClient.management.accessKey.load('key-id');

// Search all users, optionally according to tenant and/or role filter
const accessKeysRes = await descopeClient.management.accessKey.searchAll(['tenant-ID']);
accessKeysRes.data.forEach((accessKey) => {
  // do something
});

// Update will override all fields as is. Use carefully.
await descopeClient.management.accessKey.update('key-id', 'new-key-name');

// Access keys can be deactivated to prevent usage. This can be undone using "activate".
await descopeClient.management.accessKey.deactivate('key-id');

// Disabled access keys can be activated once again.
await descopeClient.management.accessKey.activate('key-id');

// Access key deletion cannot be undone. Use carefully.
await descopeClient.management.accessKey.delete('key-id');
```

### Manage SSO Setting

You can manage SSO settings and map SSO group roles and user attributes.

```typescript
// You can get SSO settings for a specific tenant ID
const ssoSettings = await descopeClient.management.sso.getSettings("tenant-id")

// You can configure SSO settings manually by setting the required fields directly
const tenantId = 'tenant-id' // Which tenant this configuration is for
const idpURL = 'https://idp.com'
const entityID = 'my-idp-entity-id'
const idpCert = '<your-cert-here>'
const redirectURL = 'https://my-app.com/handle-saml' // Global redirect URL for SSO/SAML
const domain = 'tenant-users.com' // Users authentication with this domain will be logged in to this tenant
await descopeClient.management.sso.configureSettings(tenantID, idpURL, entityID, idpCert, redirectURL, domain)

// Alternatively, configure using an SSO metadata URL
await descopeClient.management.sso.configureMetadata(tenantID, 'https://idp.com/my-idp-metadata')

// Map IDP groups to Descope roles, or map user attributes.
// This function overrides any previous mapping (even when empty). Use carefully.
await descopeClient.management.sso.configureMapping(
   tenantId,
   [{ groups: ['IDP_ADMIN'], roleName: 'Tenant Admin'}]
   { name: 'IDP_NAME', phoneNumber: 'IDP_PHONE'},
)
```

Note: Certificates should have a similar structure to:

```
-----BEGIN CERTIFICATE-----
Certifcate contents
-----END CERTIFICATE-----
```

// You can delete SSO settings for a specific tenant ID
await descopeClient.management.sso.deleteSettings("tenant-id")

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

### Query SSO Groups

You can query SSO groups:

```typescript
// Load all groups for a given tenant id
const groupsRes = descopeClient.management.group.loadAllGroups('tenant-id');

// Load all groups for the given user IDs (can be found in the user's JWT)
const groupsRes = descopeClient.management.group.loadAllGroupsForMember('tenant-id', [
  'user-id-1',
  'user-id-2',
]);

// Load all groups for the given user login IDs (used for sign-in)
const groupsRes = descopeClient.management.group.loadAllGroupsForMember(
  'tenant-id',
  [],
  ['login-id-1', 'login-id-2'],
);

// Load all group's members by the given group id
const groupsRes = descopeClient.management.group.loadAllGroupMembers('tenant-id', 'group-id');

groupsRes.data.forEach((group) => {
  // do something
});
```

### Manage Flows

You can list your flows and also import and export flows and screens, or the project theme:

```typescript
// List all project flows
const res = await descopeClient.management.flow.list();
console.log('found total flows', res.total);
res.flows.forEach((flowMetadata) => {
  // do something
});
// Export the flow and it's matching screens based on the given id
const res = await descopeClient.management.flow.export('sign-up');
console.log('found flow', res.data.flow);
res.data.screens.forEach((screen) => {
  // do something
});

// Import the given flow and screens as the given id
const { flow, screens } = res.data;
const updatedRes = descopeClient.management.flow.import('sign-up', flow, screens);
console.log('updated flow', updatedRes.data.flow);
updatedRes.data.screens.forEach((screen) => {
  // do something
});

// Export the current theme of the project
const res = descopeClient.management.theme.export();
console.log(res.data.theme);

// Import the given theme to the project
const updatedRes = descopeClient.management.theme.import(theme);
console.log(updatedRes.data.theme);
```

### Manage JWTs

You can add custom claims to a valid JWT.

```typescript
const updatedJWTRes = await descopeClient.management.jwt.update('original-jwt', {
  customKey1: 'custom-value1',
  customKey2: 'custom-value2',
});
```

### Search Audit

You can perform an audit search for either specific values or full-text across the fields. Audit search is limited to the last 30 days.

```typescript
// Full text search on the last 10 days
const audits = await descopeClient.management.audit.search({
  from: Date.now() - 10 * 24 * 60 * 60 * 1000,
  text: 'some-text',
});
console.log(audits);

// Search successful logins in the last 30 days
const audits = await descopeClient.management.audit.search({ actions: ['LoginSucceed'] });
console.log(audits);
```

### Utils for your end to end (e2e) tests and integration tests

To ease your e2e tests, we exposed dedicated management methods,
that way, you don't need to use 3rd party messaging services in order to receive sign-in/up Emails or SMS, and avoid the need of parsing the code and token from them.

```typescript
// User for test can be created, this user will be able to generate code/link without
// the need of 3rd party messaging services.
// Test user must have a loginId, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
await descopeClient.management.user.createTestUser(
  'desmond@descope.com',
  'desmond@descope.com',
  null,
  'Desmond Copeland',
  null,
  [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
);

// Now test user got created, and this user will be available until you delete it,
// you can use any management operation for test user CRUD.
// You can also delete all test users.
await descopeClient.management.user.deleteAllTestUsers();

// OTP code can be generated for test user, for example:
const { code } = await descopeClient.management.user.generateOTPForTestUser(
  'sms',
  'desmond@descope.com',
);
// Now you can verify the code is valid (using descopeClient.auth.*.verify for example)

// Same as OTP, magic link can be generated for test user, for example:
const { link } = await descopeClient.management.user.generateMagicLinkForTestUser(
  'email',
  'desmond@descope.com',
  '',
);

// Enchanted link can be generated for test user, for example:
const { link, pendingRef } = await descopeClient.management.user.generateEnchantedLinkForTestUser(
  'desmond@descope.com',
  '',
);

// Note 1: The generate code/link functions, work only for test users, will not work for regular users.
// Note 2: In case of testing sign-in / sign-up operations with test users, need to make sure to generate the code prior calling the sign-in / sign-up operations.
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

## Providing Custom Public Key

By default, the SDK will download the public key from Descope's servers. You can also provide your own public key. This is useful when the server you are running the SDK on does not have access to the internet.

You can find your public key in the `https://api.descope.com/v2/keys/<project-id>` endpoint. For further information, please see the [Descope Documentation and API reference page](https://docs.descope.com/api/openapi/sessiongetkeys/operation/GetKeysV2).

To provide your own public key, you can do so by providing the `publicKey` option when initializing the SDK:

```typescript
import DescopeClient from '@descope/node-sdk';

const descopeClient = DescopeClient({
  projectId: 'my-project-ID',
  publicKey: '{"alg":"RS256", ... }',
});

// The public key will be used when validating jwt
const sessionJWt = '<session-jwt>';
await descopeClient.validateJwt(sessionJWt);
```

## Learn More

To learn more please see the [Descope Documentation and API reference page](https://docs.descope.com/).

## Contact Us

If you need help you can email [Descope Support](mailto:support@descope.com)

## License

The Descope SDK for Node.js is licensed for use under the terms and conditions of the [MIT license Agreement](https://github.com/descope/node-sdk/blob/main/LICENSE).
