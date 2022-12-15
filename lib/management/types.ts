/** Represents a tenant association for a User. The tenantId is required to denote
 * which tenant the user belongs to. The roleNames array is an optional list of
 * roles for the user in this specific tenant.
 */
export type UserTenant = {
  tenantId: string;
  roleNames: string[];
};

/** The tenantId of a newly created tenant */
export type CreateTenantResponse = {
  tenantId: string;
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
