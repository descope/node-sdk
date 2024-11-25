import { UserResponse } from '@descope/core-js-sdk';

export type ExpirationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

/**
 * Represents a tenant association for a User or Access Key. The tenantId is required to denote
 * which tenant the user or access key belongs to. The roleNames array is an optional list of
 * roles for the user or access key in this specific tenant.
 */
export type AssociatedTenant = {
  tenantId: string;
  roleNames: string[];
};

/** The tenantId of a newly created tenant */
export type CreateTenantResponse = {
  id: string;
};

export type GenerateSSOConfigurationLinkResponse = {
  adminSSOConfigurationLink: string;
};

/**
 * Options to create or update an OIDC application.
 *
 * **Note:** When updating, `id` will be required to perform the operation
 */
export type OidcApplicationOptions = {
  name: string;
  loginPageUrl: string;
  id?: string;
  description?: string;
  logo?: string;
  enabled?: boolean;
  forceAuthentication?: boolean;
};

/**
 * Options to create or update a SAML application.
 *
 * **Note:** When updating, `id` will be required to perform the operation
 */
export type SamlApplicationOptions = {
  name: string;
  loginPageUrl: string;
  id?: string;
  description?: string;
  logo?: string;
  enabled?: boolean;
  useMetadataInfo?: boolean;
  metadataUrl?: string;
  entityId?: string;
  acsUrl?: string;
  certificate?: string;
  attributeMapping?: SamlIdpAttributeMappingInfo[];
  groupsMapping?: SamlIdpGroupsMappingInfo[];
  acsAllowedCallbacks?: string[];
  subjectNameIdType?: string;
  subjectNameIdFormat?: string;
  defaultRelayState?: string;
  forceAuthentication?: boolean;
  logoutRedirectUrl?: string;
};

/**
 * Represents a SAML IDP attribute mapping object. Use this class for mapping Descope attribute
 * to the relevant SAML Assertion attributes matching your expected SP attributes names.
 */
export type SamlIdpAttributeMappingInfo = {
  name: string;
  type: string;
  value: string;
};

/** Represents a SAML IDP Role Group mapping object. */
export type SAMLIDPRoleGroupMappingInfo = {
  id: string;
  name: string;
};

/**
 * Represents a SAML IDP groups mapping object. Use this class for mapping Descope roles
 * to the relevant SAML Assertion groups attributes that matching your expected SP groups attributes names.
 */
export type SamlIdpGroupsMappingInfo = {
  name: string;
  type: string;
  filterType: string;
  value: string;
  roles: SAMLIDPRoleGroupMappingInfo[];
};

/** The ID of a newly created SSO application */
export type CreateSSOApplicationResponse = {
  id: string;
};

/** An access key that can be used to access descope */
export type AccessKey = {
  id: string;
  name: string;
  expiredTime: number;
  roleNames: string[];
  keyTenants?: AssociatedTenant[];
  status: string;
  createdTime: number;
  expiresTime: number;
  createdBy: string;
  clientId: string;
  boundUserId?: string;
  description?: string;
  permittedIps?: string[];
};

/** Access Key extended details including created key cleartext */
export type CreatedAccessKeyResponse = {
  key: AccessKey;
  cleartext: string;
};

/** Represents a mapping between a set of groups of users and a role that will be assigned to them */
export type RoleMapping = {
  groups: string[];
  roleName: string;
};

export type RoleMappings = RoleMapping[];

/** Represents a mapping between Descope and IDP user attributes */
export type AttributeMapping = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  group?: string;
};

/** UpdateJWT response with a new JWT value with the added custom claims */
export type UpdateJWTResponse = {
  jwt: string;
};

/** Represents a tenant in a project. It has an id, a name and an array of
 * self provisioning domains used to associate users with that tenant.
 */
export type Tenant = {
  id: string;
  name: string;
  selfProvisioningDomains: string[];
  createdTime: number;
  customAttributes?: Record<string, string | number | boolean>;
  domains?: string[];
  authType?: 'none' | 'saml' | 'oidc';
};

/** Represents settings of a tenant in a project. It has an id, a name and an array of
 * self provisioning domains used to associate users with that tenant.
 */
export type TenantSettings = {
  selfProvisioningDomains: string[];
  domains?: string[];
  authType?: 'none' | 'saml' | 'oidc';
  sessionSettingsEnabled?: boolean;
  refreshTokenExpiration?: number;
  refreshTokenExpirationUnit?: ExpirationUnit;
  sessionTokenExpiration?: number;
  sessionTokenExpirationUnit?: ExpirationUnit;
  stepupTokenExpiration?: number;
  stepupTokenExpirationUnit?: ExpirationUnit;
  enableInactivity?: boolean;
  InactivityTime?: number;
  InactivityTimeUnit?: ExpirationUnit;
  JITDisabled?: boolean;
};

/** Represents password settings of a tenant in a project. It has the password policy details. */
export type PasswordSettings = {
  enabled: boolean;
  minLength: number;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  nonAlphaNumeric: boolean;
  expiration: boolean;
  expirationWeeks: number;
  reuse: boolean;
  reuseAmount: number;
  lock: boolean;
  lockAttempts: number;
};

/** Represents OIDC settings of an SSO application in a project. */
export type SSOApplicationOIDCSettings = {
  loginPageUrl: string;
  issuer: string;
  discoveryUrl: string;
  forceAuthentication: boolean;
};

/** Represents SAML settings of an SSO application in a project. */
export type SSOApplicationSAMLSettings = {
  loginPageUrl: string;
  idpCert: string;
  useMetadataInfo: boolean;
  metadataUrl: string;
  entityId: string;
  acsUrl: string;
  certificate: string;
  attributeMapping: SamlIdpAttributeMappingInfo[];
  groupsMapping: SamlIdpGroupsMappingInfo[];
  idpMetadataUrl: string;
  idpEntityId: string;
  idpSsoUrl: string;
  acsAllowedCallbacks: string[];
  subjectNameIdType: string;
  subjectNameIdFormat: string;
  defaultRelayState: string;
  forceAuthentication: boolean;
  idpLogoutUrl: string;
  logoutRedirectUrl: string;
};

/** Represents an SSO application in a project. */
export type SSOApplication = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  logo: string;
  appType: string;
  samlSettings: SSOApplicationSAMLSettings;
  oidcSettings: SSOApplicationOIDCSettings;
};

/** Represents a permission in a project. It has a name and optionally a description.
 * It also has a flag indicating whether it is system default or not.
 */
export type Permission = {
  name: string;
  description?: string;
  systemDefault: boolean;
};

/** Represents a role in a project. It has a name and optionally a description and
 * a list of permissions it grants.
 */
export type Role = {
  name: string;
  description?: string;
  permissionNames: string[];
  createdTime: number;
  tenantId?: string;
};

/** Search roles based on the parameters */
export type RoleSearchOptions = {
  tenantIds?: string[];
  roleNames?: string[];
  roleNameLike?: string; // Search roles where name contains this - case insensitive
  permissionNames?: string[];
};

/** Represents a group in a project. It has an id and display name and a list of group members. */
export type Group = {
  id: string;
  display: string;
  members?: GroupMember[];
};

/** Represents a group member. It has loginId, userId and display. */
export type GroupMember = {
  loginId: string;
  userId: string;
  display: string;
};

export type Flow = {
  id: string;
  name: string;
  description?: string;
  dsl: any;
  disabled: boolean;
  etag?: string;
};

export type FlowMetadata = {
  id: string;
  name: string;
  description?: string;
  disabled: boolean;
};

export type Screen = {
  id: string;
  flowId: string;
  inputs?: any;
  interactions?: any;
  htmlTemplate: any;
};

export type FlowsResponse = {
  flows: FlowMetadata[];
  total: number;
};

export type FlowResponse = {
  flow: Flow;
  screens: Screen[];
};

export type Theme = {
  id: string;
  cssTemplate?: any;
};

export type ThemeResponse = {
  theme: Theme;
};

export type GenerateOTPForTestResponse = {
  loginId: string;
  code: string;
};

export type GenerateMagicLinkForTestResponse = {
  loginId: string;
  link: string;
};

export type GenerateEnchantedLinkForTestResponse = {
  loginId: string;
  link: string;
  pendingRef: string;
};

export type GenerateEmbeddedLinkResponse = {
  token: string;
};

export type AttributesTypes = string | boolean | number;

export type TemplateOptions = Record<string, string>; // for providing messaging template options (templates that are being sent via email / text message)

export type User = {
  loginId: string;
  email?: string;
  phone?: string;
  displayName?: string;
  roles?: string[];
  userTenants?: AssociatedTenant[];
  customAttributes?: Record<string, AttributesTypes>;
  picture?: string;
  verifiedEmail?: boolean;
  verifiedPhone?: boolean;
  test?: boolean;
  additionalLoginIds?: string[];
  password?: string; // a cleartext password to set for the user
  hashedPassword?: UserPasswordHashed; // a prehashed password to set for the user
  seed?: string; // a TOTP seed to set for the user in case of batch invite
};

// The kind of prehashed password to set for a user (only one should be set)
export type UserPasswordHashed = {
  bcrypt?: UserPasswordBcrypt;
  pbkdf2?: UserPasswordPbkdf2;
  firebase?: UserPasswordFirebase;
  django?: UserPasswordDjango;
  phpass?: UserPasswordPhpass;
  md5?: UserPasswordMd5;
};

export type UserPasswordBcrypt = {
  hash: string; // the bcrypt hash in plaintext format, for example "$2a$..."
};

export type UserPasswordPbkdf2 = {
  hash: string; // the password hash as a base64 string (standard encoding with padding)
  salt: string; // the salt as a base64 string (standard encoding with padding)
  iterations: number; // the iterations cost value (usually in the thousands)
  type: 'sha1' | 'sha256' | 'sha512'; // the type of hash algorithm used
};

export type UserPasswordFirebase = {
  hash: string; // the password hash as a base64 string (standard encoding with padding)
  salt: string; // the salt as a base64 string (standard encoding with padding)
  saltSeparator: string; // the salt separator (usually 1 byte) as a base64 string (standard encoding with padding)
  signerKey: string; // the signer key as a base64 string (standard encoding with padding)
  memory: number; // the memory cost value (usually between 12 to 17)
  rounds: number; // the rounds cost value (usually between 6 to 10)
};

export type UserPasswordDjango = {
  hash: string; // the django hash in plaintext format, for example "pbkdf2_sha256$..."
};

export type UserPasswordPhpass = {
  hash: string; // the hash as base64 encoded string with . and / characters
  salt: string; // the salt as base64 encoded string with . and / characters
  iterations: number; // the iterations cost value (usually in the tens of thousands)
  type: 'md5' | 'sha512'; // the type of hash algorithm used
};

export type UserPasswordMd5 = {
  hash: string; // the md5 hash in plaintext format, for example "68f724c9ad..."
};

export type UserMapping = {
  name: string;
  email: string;
  username: string;
  phoneNumber: string;
  group: string;
};

export type RoleItem = {
  id: string;
  name: string;
};

export type GroupsMapping = {
  role: RoleItem;
  groups: string[];
};

export type SSOSettingsResponse = {
  tenantId: string;
  idpEntityId: string;
  idpSSOUrl: string;
  idpCertificate: string;
  idpMetadataUrl: string;
  spEntityId: string;
  spACSUrl: string;
  spCertificate: string;
  userMapping: UserMapping;
  groupsMapping: GroupsMapping[];
  redirectUrl: string;
  domains: string[];
  // Deprecated - use domains instead
  domain: string;
};

export type SSOSAMLSettingsResponse = {
  idpEntityId: string;
  idpSSOUrl: string;
  idpCertificate: string;
  idpMetadataUrl: string;
  spEntityId: string;
  spACSUrl: string;
  spCertificate: string;
  attributeMapping: AttributeMapping;
  groupsMapping: RoleMappings;
  redirectUrl: string;
};

export type SSOSettings = {
  tenant: Tenant;
  saml?: SSOSAMLSettingsResponse;
  oidc?: SSOOIDCSettings;
};

export type OIDCAttributeMapping = {
  loginId?: string;
  name?: string;
  givenName?: string;
  middleName?: string;
  familyName?: string;
  email?: string;
  verifiedEmail?: string;
  username?: string;
  phoneNumber?: string;
  verifiedPhone?: string;
  picture?: string;
};

export type Prompt = 'none' | 'login' | 'consent' | 'select_account';

export type SSOOIDCSettings = {
  name: string;
  clientId: string;
  clientSecret?: string;
  redirectUrl?: string;
  authUrl?: string;
  tokenUrl?: string;
  userDataUrl?: string;
  scope?: string[];
  JWKsUrl?: string;
  attributeMapping?: OIDCAttributeMapping;
  manageProviderTokens?: boolean;
  callbackDomain?: string;
  prompt?: Prompt[];
  grantType?: 'authorization_code' | 'implicit';
  issuer?: string;
};

export type SSOSAMLSettings = {
  idpUrl: string;
  idpCert: string;
  entityId: string;
  roleMappings?: RoleMappings;
  attributeMapping?: AttributeMapping;

  // NOTICE - the following fields should be overridden only in case of SSO migration, otherwise, do not modify these fields
  spACSUrl?: string;
  spEntityId?: string;
};

export type SSOSAMLByMetadataSettings = {
  idpMetadataUrl: string;
  roleMappings?: RoleMappings;
  attributeMapping?: AttributeMapping;

  // NOTICE - the following fields should be overridden only in case of SSO migration, otherwise, do not modify these fields
  spACSUrl?: string;
  spEntityId?: string;
};

export type ProviderTokenOptions = {
  withRefreshToken?: boolean;
  forceRefresh?: boolean;
};

export type ProviderTokenResponse = {
  provider: string;
  providerUserId: string;
  accessToken: string;
  expiration: number;
  scopes: string[];
};

export type UserFailedResponse = {
  failure: string;
  user: UserResponse;
};

export type InviteBatchResponse = {
  createdUsers: UserResponse[];
  failedUsers: UserFailedResponse[];
  additionalErrors: Record<string, string>;
};

/**
 * Search options to filter which audit records we should retrieve.
 * All parameters are optional. `From` is currently limited to 30 days.
 */
export type AuditSearchOptions = {
  userIds?: string[]; // List of users to filter by
  actions?: string[]; // List of actions to filter by
  excludedActions?: string[]; // List of actions to exclude
  devices?: string[]; // List of devices to filter by. Current devices supported are "Bot"/"Mobile"/"Desktop"/"Tablet"/"Unknown"
  methods?: string[]; // List of methods to filter by. Current auth methods are "otp"/"totp"/"magiclink"/"oauth"/"saml"/"password"
  geos?: string[]; // List of geos to filter by. Geo is currently country code like "US", "IL", etc.
  remoteAddresses?: string[]; // List of remote addresses to filter by
  loginIds?: string[]; // List of login IDs to filter by
  tenants?: string[]; // List of tenants to filter by
  noTenants?: boolean; // Should audits without any tenants always be included
  text?: string; // Free text search across all fields
  from?: number; // Retrieve records newer than given time. Limited to no older than 30 days. Time is from epoch in milliseconds.
  to?: number; // Retrieve records older than given time. Time is from epoch in milliseconds.
};

export type AuditType = 'info' | 'warn' | 'error';

/** Audit create options for creating audit event */
export type AuditCreateOptions = {
  userId?: string;
  action: string;
  type: AuditType;
  actorId: string;
  tenantId: string;
  data?: Record<string, any>;
};

/** Audit record response from the audit trail. Occurred is in milliseconds. */
export type AuditRecord = {
  projectId: string;
  userId: string;
  action: string;
  occurred: number;
  device: string;
  method: string;
  geo: string;
  remoteAddress: string;
  loginIds: string[];
  tenants: string[];
  data: Record<string, any>;
};

export type UserStatus = 'enabled' | 'disabled' | 'invited';

export type AuthzNodeExpressionType =
  | 'self' // direct relation expression
  | 'targetSet' // expression via another relation definition target
  | 'relationLeft' // expression via parent relation like org within org and membership
  | 'relationRight'; // expression via child relation like folder within folder and owner

/**
 * AuthzNodeExpression holds the definition of a child node
 */
export type AuthzNodeExpression = {
  neType: AuthzNodeExpressionType;
  relationDefinition?: string;
  relationDefinitionNamespace?: string;
  targetRelationDefinition?: string;
  targetRelationDefinitionNamespace?: string;
};

export type AuthzNodeType =
  | 'child' // regular child node in relation definition
  // union node of multiple children
  // Example: editor of document is union between
  // 1. Direct editor relation - someone that has editor on document
  // 2. Owner relation - someone who is owner of document
  // 3. Editor of containing folder relation - someone who is editor of the folder that has parent relation to doc
  | 'union'
  | 'intersect' // intersect between multiple children
  | 'sub'; // sub between the first child and the rest

/**
 * AuthzNode holds the definition of a complex relation definition
 */
export type AuthzNode = {
  nType: AuthzNodeType;
  children?: AuthzNode[];
  expression?: AuthzNodeExpression;
};

/**
 * AuthzRelationDefinition defines a relation within a namespace
 */
export type AuthzRelationDefinition = {
  name: string;
  complexDefinition?: AuthzNode;
};

/**
 * AuthzNamespace defines an entity in the authorization schema
 */
export type AuthzNamespace = {
  name: string;
  relationDefinitions: AuthzRelationDefinition[];
};

/**
 * AuthzSchema holds the full schema (all namespaces) for a project
 */
export type AuthzSchema = {
  name?: string;
  namespaces: AuthzNamespace[];
};

/**
 * AuthzUserQuery represents a target of a relation for ABAC (query on users)
 */
export type AuthzUserQuery = {
  tenants?: string[];
  roles?: string[];
  text?: string;
  statuses?: UserStatus[];
  ssoOnly?: boolean;
  withTestUser?: boolean;
  customAttributes?: Record<string, any>;
};

/**
 * AuthzRelation defines a relation between resource and target
 */
export type AuthzRelation = {
  resource: string;
  relationDefinition: string;
  namespace: string;
  target?: string;
  targetSetResource?: string;
  targetSetRelationDefinition?: string;
  targetSetRelationDefinitionNamespace?: string;
  query?: AuthzUserQuery;
};

/**
 * AuthzRelationQuery queries the service if a given relation exists
 */
export type AuthzRelationQuery = {
  resource: string;
  relationDefinition: string;
  namespace: string;
  target: string;
  hasRelation?: boolean;
};

/**
 * AuthzModified has the list of resources and targets that were modified since given time returned from GetModified
 */
export type AuthzModified = {
  resources: string[];
  targets: string[];
  schemaChanged: boolean;
};

// Currently only production environment is supported
export type ProjectEnvironment = 'production';

export type ExportSnapshotResponse = {
  /** All project settings and configurations represented as JSON files */
  files: Record<string, any>;
};

export type ImportSnapshotRequest = {
  /** All project settings and configurations represented as JSON files */
  files: Record<string, any>;
  /**
   * An optional map of project entities and their secrets that will be
   * injected into the snapshot before import (see below)
   */
  inputSecrets?: SnapshotSecrets;
};

export type ValidateSnapshotRequest = {
  /** All project settings and configurations represented as JSON files */
  files: Record<string, any>;
  /**
   * An optional map of project entities and their secrets that will be
   * injected into the snapshot before validation (see below)
   */
  inputSecrets?: SnapshotSecrets;
};

export type ValidateSnapshotResponse = {
  /** Whether the validation passed or not (true if and only if `failures` is empty) */
  ok: boolean;
  /** An array with `string` representations of any validation failures that were found */
  failures?: string[];
  /**
   * An optional object that lists which if any secret values need to be provided in
   * the request for an `importSnapshot` call so it doesn't fail (see below)
   */
  missingSecrets?: SnapshotSecrets;
};

export type SnapshotSecrets = {
  /** Any missing or input secrets for connectors in a snapshot */
  connectors?: SnapshotSecret[];
  /** Any missing or input secrets for OAuth providers in a snapshot */
  oauthProviders?: SnapshotSecret[];
};

export type SnapshotSecret = {
  /** The id of the project entity that requires this secret */
  id: string;
  /** The name of the project entity that requires this secret */
  name: string;
  /** The type of secret, e.g., "bearertoken", "password" */
  type: string;
  /**
   * The cleartext value of the secret. This value must not be empty when used in
   * request objects when calling ValidateSnapshot and ImportSnapshot. Conversely,
   * this value is an empty string when returned in ValidateSnapshotResponse to
   * signify that this is a missing secret.
   */
  value: string;
};

export type CloneProjectResponse = {
  projectId: string;
  projectName: string;
  environment?: string;
  tags?: string[];
};

export type Project = {
  id: string;
  name: string;
  environment?: string;
  tags?: string[];
};

// Define the types for the SaveDSLSchema endpoint
export type FGASchema = {
  dsl: string;
};

// Define the types for the Tuple
export type FGARelation = {
  resource: string;
  resourceType?: string;
  relation: string;
  target: string;
  targetType?: string;
};

export type CheckResponseRelation = {
  allowed: boolean;
  tuple: FGARelation;
};
