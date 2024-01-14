import { UserResponse } from '@descope/core-js-sdk';

/** Represents a tenant association for a User or Access Key. The tenantId is required to denote
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
  customAttributes?: Record<string, string | number | boolean>;
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

// Currently only production tag is supported
export type ProjectTag = 'production';

export type CloneProjectResponse = {
  projectId: string;
  projectName: string;
  tag?: string;
};
