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
};

/** Access Key extended details including created key cleartext */
export type CreatedAccessKeyResponse = {
  key: AccessKey;
  cleartext: string;
};

/** Represents a mapping between a set of groups of users and a role that will be assigned to them */
export type RoleMapping = {
  groups: string[];
  role: string;
};

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

export type Screen = {
  id: string;
  flowId: string;
  inputs?: any;
  interactions?: any;
  htmlTemplate: any;
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
