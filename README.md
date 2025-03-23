# Descope SDK for Node.js

The Descope SDK for Node.js provides convenient access to the Descope user management and authentication API
for a backend written in Node.js. You can read more on the [Descope Website](https://descope.com).

## Requirements

The SDK supports Node version 14 and above.

## uninstalling the SDK

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



## Management Functions

### Setup

Before you can use management functions listed below, you must initialize `descopeClient`.

If you wish to also use management functions, you will need to initialize a new version of your `descopeClient`, but this time with a `ManagementKey` as well as your `Project ID`. Create a management key in the [Descope Console](https://app.descope.com/settings/company/managementkeys).

```typescript
import Descopeowner from '@descope/node-sdk';

const descopeClient = Descopeowner
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
10. [Impersonate](#impersonate)
11. [Embedded Links](#embedded-links)
12. [Audit](#audit)
13. [Manage FGA (Fine-grained Authorization)](#manage-fga-fine-grained-authorization)
14. [Manage Project](#manage-project)
15. [Manage SSO applications](#manage-sso-applications)

If you wish to run any of our code samples and play with them, check out our [Code Examples](#code-examples) section.

If you're performing end-to-end testing, check out the [Utils for your end to end (e2e) tests and integration tests](#utils-for-your-end-to-end-e2e-tests-and-integration-tests) section. You will need to use the `descopeClient` you created under the setup of [Management Functions](#management-functions).

---

## Error Handling

Every `async` operation may fail. In case it does, there will be information regarding what happened on the response object.
A typical case of error handling might look something like:

```ts
import DescopeClient, { SdkResponse } from '@descope/node-sdk';

const { DescopeErrors } = DescopeClient;

// ...

try {
  const resp = await sdk.otp.signIn.email(loginId);
  if (resp.error) {
    switch (resp.error.errorCode) {
      case DescopeErrors.userNotFound:
        // Handle specifically
        break;
      default:
      // Handle generally
      // `resp.error` will contain `errorCode`, `errorDescription` and sometimes `errorMessage` to
      // help understand what went wrong. See SdkResponse for more information.
    }
  }
} catch (e) {
  // Handle technical error
}
```

---

### OTP Authentication

Send a user a one-time password (OTP) using your preferred delivery method (_Email / SMS / Voice call / WhatsApp_). An email address or phone number must be provided accordingly.

The user can either `sign up`, `sign in` or `sign up or in`






### SSO/SAML

Users can authenticate to a specific tenant using SAML or Single Sign On. Configure your SSO/SAML settings on the [Descope console](https://app.descope.com/settings/authentication/sso). To start a flow call:

```typescript
// If configured globally, the return URL is optional. If provided however, it will be used
// instead of any global configuration.
const redirectUrl = 'https://my-app.com/handle-saml';
const urlRes = await descopeClient.saml.start('tenant'); // Choose which tenant to log into. An email can also be provided here and the domain will be extracted from it
urlRes.data.url; // Redirect the user to the given returned URL to start the SSO/SAML redirect chain
```


```


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
      error: 'Unauthorized!',
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
const validTenantPermissions = descopeClient.validateTenantPermissions(authInfo, 'my-tenant-ID', [
  'Permission to validate',
]);
if (!validTenantPermissions) {
  // Deny access
}

// Or validate roles directly
const validTenantRoles = descopeClient.validateTenantRoles(authInfo, 'my-tenant-ID', [
  'Role to validate',
]);
if (!validTenantRoles) {
  // Deny access
}

// Or get the matched roles/permissions
const matchedTenantRoles = descopeClient.getMatchedTenantRoles(authInfo, 'my-tenant-ID', [
  'Role to validate',
  'Another role to validate',
]);

const matchedTenantPermissions = descopeClient.getMatchedTenantPermissions(
  authInfo,
  'my-tenant-ID',
  ['Permission to validate', 'Another permission to validate'],
);
```

When not using tenants use:

```typescript
// You can validate specific permissions
const validPermissions = descopeClient.validatePermissions(authInfo, ['Permission to validate']);
if (!validPermissions) {
  // Deny access
}

// Or validate roles directly
const validRoles = descopeClient.validateRoles(authInfo, ['Role to validate']);
if (!validRoles) {
  // Deny access
}

// Or get the matched roles/permissions
const matchedRoles = descopeClient.getMatchedRoles(authInfo, [
  'Role to validate',
  'Another role to validate',
]);

const matchedPermissions = descopeClient.getMatchedPermissions(authInfo, [
  'Permission to validate',
  'Another permission to validate',
]);
```

### Logging Out

You can log out a user from an active session by providing their `refreshToken` for that session.
After calling this function, you must invalidate or save any cookies you have created.

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

You can create, update, delete or load tenants, as well as read and update tenant settings:

```typescript
// The self provisioning domains or optional. If given they'll be used to associate
// Users logging in to this tenant
await descopeClient.management.tenant.create('My Tenant', ['domain.com'], {
  customAttributeName: 'val',
});

// You can optionally set your own ID when creating a tenant
await descopeClient.management.tenant.createWithId('my-custom-id', 'My Tenant', ['domain.com'], {
  customAttributeName: 'val',
});

// Update will override all fields as is. Use carefully.
await descopeClient.management.tenant.update(
  'my-custom-id',
  'My Tenant',
  ['domain.com', 'another-domain.com'],
  { customAttributeName: 'val' },
);

// Tenant deletion cannot be undone. Use carefully.
// Pass true to cascade value, in case you want to delete all users/keys associated only with this tenant
await descopeClient.management.tenant.delete('my-custom-id', false);

// Load tenant by id
const tenant = await descopeClient.management.tenant.load('my-custom-id');

// Load all tenants
const tenantsRes = await descopeClient.management.tenant.loadAll();
tenantsRes.data.forEach((tenant) => {
  // do something
});

// Search all tenants according to various parameters
const searchRes = await descopeClient.management.tenant.searchAll(['id']);
searchRes.data.forEach((tenant) => {
  // do something
});

// Load tenant settings by id
const tenantSettings = await descopeClient.management.tenant.getSettings('my-tenant-id');

// Update will override all fields as is. Use carefully.
await descopeClient.management.tenant.configureSettings('my-tenant-id', {
  domains: ['domain1.com'],
  selfProvisioningDomains: ['domain1.com'],
  sessionSettingsEnabled: true,
  refreshTokenExpiration: 12,
  refreshTokenExpirationUnit: 'days',
  sessionTokenExpiration: 10,
  sessionTokenExpirationUnit: 'minutes',
  enableInactivity: true,
  JITDisabled: false,
  InactivityTime: 10,
  InactivityTimeUnit: 'minutes',
});

// Generate tenant admin self service link for SSO Suite (valid for 24 hours)
// ssoId can be provided for a specific sso configuration
// email can be provided to send the link to (email's templateId can be provided as well)
const res = await descopeClient.management.tenant.generateSSOConfigurationLink(
  'my-tenant-id',
  60 * 60 * 24,
);
console.log(res.adminSSOConfigurationLink);
```

### Manage Password

You can read and update any tenant password settings and policy:

```typescript
// Load tenant password settings by id
const passwordSettings = await descopeClient.management.password.getSettings('my-tenant-id');

// Update will override all fields as is. Use carefully.
await descopeClient.management.password.configureSettings('my-tenant-id', {
  enabled: true,
  minLength: 8,
  expiration: true,
  expirationWeeks: 4,
  lock: true,
  lockAttempts: 5,
  reuse: true,
  reuseAmount: 6,
  lowercase: true,
  uppercase: false,
  number: true,
  nonAlphaNumeric: false,
});
```

### Manage SSO applications

You can create, update, delete or load SSO applications:

```typescript
// Create OIDC sso application
await descopeClient.management.ssoApplication.createOidcApplication({
  name: 'My OIDC app name',
  loginPageUrl: 'http://dummy.com/login',
});

// Create SAML sso application
await descopeClient.management.ssoApplication.createSamlApplication({
  name: 'My SAML app name',
  loginPageUrl: 'http://dummy.com/login',
  useMetadataInfo: true,
  metadataUrl: 'http://dummy.com/metadata',
});

// Update OIDC sso application.
// Update will override all fields as is. Use carefully.
await descopeClient.management.ssoApplication.updateOidcApplication({
  id: 'my-app-id',
  name: 'My OIDC app name',
  loginPageUrl: 'http://dummy.com/login',
});

// Update SAML sso application.
// Update will override all fields as is. Use carefully.
await descopeClient.management.ssoApplication.updateSamlApplication({
  id: 'my-app-id',
  name: 'My SAML app name',
  loginPageUrl: 'http://dummy.com/login',
  enabled: true,
  useMetadataInfo: false,
  entityId: 'entity1234',
  aceUrl: 'http://dummy.com/acs',
  certificate: 'certificate',
});

// Tenant deletion cannot be undone. Use carefully.
await descopeClient.management.ssoApplication.delete('my-app-id');

// Load sso application by id
const app = await descopeClient.management.ssoApplication.load('my-app-id');

// Load all sso applications
const appsRes = await descopeClient.management.ssoApplication.loadAll();
appsRes.data.forEach((app) => {
  // do something
});
```

### Manage Users

You can create, update, delete or load users, as well as search according to filters:

```typescript
// A user must have a login ID, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
await descopeClient.management.user.create('desmond@descope.com', {
  email: 'desmond@descope.com',
  displayName: 'Desmond Copeland',
  userTenants: [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
});

// Alternatively, a user can be created and invited via an email / text message.
// Make sure to configure the invite URL in the Descope console prior to using this function,
// and that an email address / phone number is provided in the information.
await descopeClient.management.user.invite('desmond@descope.com', {
  email: 'desmond@descope.com',
  displayName: 'Desmond Copeland',
  userTenants: [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
  // You can override the project's User Invitation Redirect URL with this parameter
  inviteUrl: '<invite-url>',
  // You can inject custom data into the template.
  // Note that you first need to configure custom template in Descope Console
  // For example: configure {{options_k1}} in the custom template, and pass { k1: 'v1' } as templateOptions
  templateOptions: { k1: 'v1', k2: 'v2' },
});

// You can invite batch of users via an email / text message.
// Make sure to configure the invite URL in the Descope console prior to using this function,
// and that an email address / phone number is provided in the information. You can also set
// a cleartext password or import a prehashed one from another service.
await descopeClient.management.user.inviteBatch(
  [
    {
      loginId: 'desmond@descope.com',
      email: 'desmond@descope.com',
      phone: '+123456789123',
      displayName: 'Desmond Copeland',
      userTenants: [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
      hashedPassword: {
        bcrypt: {
          hash: '$2a$...',
        },
      },
    },
  ],
  '<invite_url>',
  true,
  false,
);

// Update will override all fields as is. Use carefully.
await descopeClient.management.user.update('desmond@descope.com', {
  email: 'desmond@descope.com',
  displayName: 'Desmond Copeland',
  userTenants: [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
});

// Update explicit data for a user rather than overriding all fields
await descopeClient.management.user.updatePhone('desmond@descope.com', '+18005551234', true);
await descopeClient.management.user.updateLoginId('desmond@descope.com', 'bane@descope.com');
await descopeClient.management.user.removeTenantRoles(
  'desmond@descope.com',
  'tenant-ID1',
  'role-name2',
);

// Update explicit user's data using patch (will override only provided fields)
const options: PatchUserOptions = { displayName: 'Desmond Copeland Jr.' };
await descopeClient.management.user.patch('desmond@descope.com', options);

// User deletion cannot be undone. Use carefully.
await descopeClient.management.user.delete('desmond@descope.com');

// Load specific user
const userRes = await descopeClient.management.user.load('desmond@descope.com');

// If needed, users can be loaded using the user ID as well
const userRes = await descopeClient.management.user.loadByUserId('<user-ID>');

// Search all users, optionally according to tenant and/or role filter
// Results can be paginated using the limit and page parameters
const usersRes = await descopeClient.management.user.search({ tenantIds: ['tenant-ID'] });
usersRes.data.forEach((user) => {
  // do something
});

await descopeClient.management.user.logoutUser('my-custom-id');

await descopeClient.management.user.logoutUserByUserId('<user-ID>');

// Get users' authentication history
const userIds = ['user-id-1', 'user-id-2'];
const usersHistoryRes = await descopeClient.management.user.history(userIds);
usersHistoryRes.forEach((userHistory) => {
  // do something
});
```

#### Set or Expire User Password

You can set a new active password for a user that they can sign in with.
You can also set a temporary password that they user will be forced to change on the next login.
For a user that already has an active password, you can expire their current password, effectively requiring them to change it on the next login.

```typescript
// Set a user's temporary password
await descopeClient.management.user.setTemporaryPassword('<login-ID>', '<some-password>');

// Set a user's password
await descopeClient.management.user.setActivePassword('<login-ID>', '<some-password>');

// Or alternatively, expire a user password
await descopeClient.management.user.expirePassword('<login-ID>');
```

### Manage Project

You can update project name and tags, as well as clone the current project to a new one:

```typescript
// Update will override all fields as is. Use carefully.
await descopeClient.management.project.updateName('new-project-name');

// Set will override all fields as is. Use carefully.
await descopeClient.management.project.updateTags(['tag1!', 'new']);

// Clone the current project to a new one
// Note that this action is supported only with a pro license or above.
const cloneRes = await descopeClient.management.project.clone('new-project-name');
```

With using a company management key you can get a list of all the projects in the company:

```typescript
const projects = await descopeClient.management.project.listProjects();
```

You can manage your project's settings and configurations by exporting a snapshot:

```typescript
// Exports the current state of the project
const exportRes = await descopeClient.management.project.exportSnapshot();
```

You can also import previously exported snapshots into the same project or a different one:

```typescript
const validateReq = {
  files: exportRes.files,
};

// Validate that an exported snapshot can be imported into the current project
const validateRes = await descopeClient.management.project.import(files);
if (!validateRes.ok) {
  // validation failed, check failures and missingSecrets to fix this
}

// Import the previously exported snapshot into the current project
const importReq = {
  files: exportRes.files,
};

await descopeClient.management.project.importSnapshot(files);
```

### Manage Access Keys

You can create, update, delete or load access keys, as well as search according to filters:

```typescript
// An access key must have a name and expiration, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
// If userId is supplied, then authorization will be ignored, and the access key will be bound to the user's authorization.
// If customClaims is supplied, then those claims will be present in the JWT returned by calls to ExchangeAccessKey.
// If description is supplied, then the access key will hold a descriptive text.
// If permittedIps is supplied, then the access key can only be used from that list of IP addresses or CIDR ranges.
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
await descopeClient.management.accessKey.update('key-id', 'new-key-name', 'new-description');

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
// You can pass ssoId in case using multi SSO and you want to load specific SSO configuration
const ssoSettings = await descopeClient.management.sso.loadSettings('tenant-id');

// You can get all configured SSO settings for a specific tenant ID (for multi SSO usage)
const allSSOSettings = await descopeClient.management.sso.loadAllSettings('tenant-id');

// You can configure SSO settings manually by setting the required fields directly
// You can pass ssoId in case using multi SSO and you want to configure specific SSO configuration
const tenantId = 'tenant-id'; // Which tenant this configuration is for
const idpURL = 'https://idp.com';
const entityID = 'my-idp-entity-id';
const idpCert = '<your-cert-here>';
const redirectURL = 'https://my-app.com/handle-sso'; // Global redirect URL for SSO/SAML
const domains = ['tenant-users.com']; // Users authentication with this domain will be logged in to this tenant
await descopeClient.management.sso.configureSAMLSettings(
  tenantID,
  { idpURL, entityID, idpCert },
  redirectURL,
  domains,
);

// Alternatively, configure using an SSO metadata URL
// You can pass ssoId in case using multi SSO and you want to configure specific SSO configuration
await descopeClient.management.sso.configureSAMLByMetadata(
  tenantID,
  { idpMetadataUrl: 'https://idp.com/my-idp-metadata' },
  redirectURL,
  domains,
);

// In case SSO is configured to work with OIDC use the following
// You can pass ssoId in case using multi SSO and you want to configure specific SSO configuration
const name = 'some-name';
const clientId = 'client id of OIDC';
const clientSecret = 'client secret';
await descopeClient.management.sso.configureOIDCSettings(
  tenantID,
  { name, clientId, clientSecret, redirectUrl },
  domains,
);

// You can create new SSO configuration (aka multi SSO)
const ssoId = 'my-new-additional-sso-id';
const displayName = 'My additional SSO configuration';
await descopeClient.management.sso.newSettings(tenantID, ssoId, displayName);

// You can delete existing SSO configuration
// You can pass ssoId in case using multi SSO and you want to delete specific SSO configuration
await descopeClient.management.sso.deleteSettings(tenantID);
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
// The optional `tenantId` will scope this role for a specific tenant. If left empty, the role will be available to all tenants.
const name = 'My Role';
const tenantId = '<tenant id>';
let description = 'Optional description to briefly explain what this role allows.';
const permissionNames = ['My Updated Permission'];
descopeClient.management.role.create(name, description, permissionNames, tenantId);

// Update will override all fields as is. Use carefully.
const newName = 'My Updated Role';
description = 'A revised description';
permissionNames.push('Another Permission');
descopeClient.management.role.update(name, newName, description, permissionNames, tenantId);

// Role deletion cannot be undone. Use carefully.
descopeClient.management.role.delete(newName, tenantId);

// Load all roles
const rolesRes = await descopeClient.management.role.loadAll();
rolesRes.data.forEach((role) => {
  // do something
});

// Search roles
const rolesRes = await descopeClient.management.role.search({
  tenantIds: ['t1', 't2'],
  roleNames: ['role1'],
});
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

// Delete flows by ids
await descopeClient.management.flow.delete(['flow-1', 'flow-2']);

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

### Impersonate

You can impersonate to another user
The impersonator user must have the `impersonation` permission in order for this request to work.
The response would be a refresh JWT of the impersonated user

```typescript
const updatedJWTRes = await descopeClient.management.jwt.impersonate(
  'impersonator-id',
  'login-id',
  true,
  { k1: 'v1' },
  't1',
);
```

Note 1: The generate code/link functions, work only for test users, will not work for regular users.
Note 2: In case of testing sign-in / sign-up operations with test users, need to make sure to generate the code prior calling the sign-in / sign-up operations.

### Embedded Links

Embedded links can be created to directly receive a verifiable token without sending it.
This token can then be verified using the magic link 'verify' function, either directly or through a flow.

```typescript
const { token } = await descopeClient.management.user.generateEmbeddedLink('desmond@descope.com', {
  key1: 'value1',
});
```

### Audit

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

You can also create audit event with data

```typescript
await descopeClient.management.audit.createEvent({
  action: 'pencil.created',
  type: 'info', // info/warn/error
  actorId: 'UXXX',
  tenantId: 'tenant-id',
  data: {
    some: 'data',
  },
});
```

### Manage FGA (Fine-grained Authorization)

Descope supports full relation based access control (ReBAC) using a zanzibar like schema and operations.
A schema is comprised of types (entities like documents, folders, orgs, etc.) and each type has relation definitions and permission to define relations to other types.

A simple example for a file system like schema would be:

```yaml
model AuthZ 1.0

type user

type org
  relation member: user
  relation parent: org

type folder
  relation parent: folder
  relation owner: user | org#member
  relation editor: user
  relation viewer: user

  permission can_create: owner | parent.owner
  permission can_edit: editor | can_create
  permission can_view: viewer | can_edit

type doc
  relation parent: folder
  relation owner: user | org#member
  relation editor: user
  relation viewer: user

  permission can_create: owner | parent.owner
  permission can_edit: editor | can_create
  permission can_view: viewer | can_edit
```

Descope SDK allows you to fully manage the schema and relations as well as perform simple (and not so simple) checks regarding the existence of relations.

```typescript
const descopeClient = require('@descope/node-sdk');

// Save schema
await descopeClient.management.fga.saveSchema(schema);

// Create a relation between a resource and user
await descopeClient.management.fga.createRelations([
  {
    resource: 'some-doc',
    resourceType: 'doc',
    relation: 'owner',
    target: 'u1',
    targetType: 'user',
  },
]);

// Check if target has a relevant relation
// The answer should be true because an owner can also view
const relations = await descopeClient.management.fga.check([
  {
    resource: 'some-doc',
    resourceType: 'doc',
    relation: 'can_view',
    target: 'u1',
    targetType: 'user',
  },
]);
```

### Utils for your end to end (e2e) tests and integration tests

To ease your e2e tests, we exposed dedicated management methods,
that way, you don't need to use 3rd party messaging services in order to receive sign-in/up Email, SMS, Voice call or WhatsApp, and avoid the need of parsing the code and token from them.

```typescript
// User for test can be created, this user will be able to generate code/link without
// the need of 3rd party messaging services.
// Test user must have a loginId, other fields are optional.
// Roles should be set directly if no tenants exist, otherwise set
// on a per-tenant basis.
await descopeClient.management.user.createTestUser('desmond@descope.com', {
  email: 'desmond@descope.com',
  displayName: 'Desmond Copeland',
  userTenants: [{ tenantId: 'tenant-ID1', roleNames: ['role-name1'] }],
});

// Search all test users according to various parameters
const searchRes = await descopeClient.management.user.searchTestUsers(['id']);
searchRes.data.forEach((user) => {
  // do something
});

// Now test user got created, and this user will be available until you delete it,
// you can use any management operation for test user CRUD.
// You can also delete all test users.
await descopeClient.management.user.deleteAllTestUsers();

// OTP code can be generated for test user, for example:
const { code } = await descopeClient.management.user.generateOTPForTestUser(
  'sms', // you can use also 'email', 'whatsapp', 'voice'
  'desmond@descope.com',
);
// Now you can verify the code is valid (using descopeClient.auth.*.verify for example)
// LoginOptions can be provided to set custom claims to the generated jwt.

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
```

## Code Examples

You can find various usage examples in the [examples folder](/examples).

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
