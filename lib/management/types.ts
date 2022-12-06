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
