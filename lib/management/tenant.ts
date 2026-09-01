import { SdkResponse, transformResponse, HttpClient } from '@descope/core-js-sdk';
import apiPaths from './paths';
import {
  CreateTenantResponse,
  Tenant,
  AttributesTypes,
  TenantSettings,
  GenerateSSOConfigurationLinkResponse,
} from './types';

type MultipleTenantResponse = {
  tenants: Tenant[];
};

const withTenant = (httpClient: HttpClient) => ({
  create: (
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
    parent?: string,
    roleInheritance?: '' | 'none' | 'userOnly',
  ): Promise<SdkResponse<CreateTenantResponse>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.create, {
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
        parent,
        roleInheritance,
      }),
    ),
  createWithId: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
    parent?: string,
    roleInheritance?: '' | 'none' | 'userOnly',
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.create, {
        id,
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
        parent,
        roleInheritance,
      }),
    ),
  update: (
    id: string,
    name: string,
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    enforceSSO?: boolean,
    disabled?: boolean,
    roleInheritance?: '' | 'none' | 'userOnly',
  ): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(apiPaths.tenant.update, {
        id,
        name,
        selfProvisioningDomains,
        customAttributes,
        enforceSSO,
        disabled,
        roleInheritance,
      }),
    ),
  updateDefaultRoles: (id: string, defaultRoles: string[]): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.tenant.updateDefaultRoles, { id, defaultRoles })),
  patchTenant: (id: string, options?: PatchTenantOptions): Promise<SdkResponse<never>> => {
    const body: Record<string, unknown> = { id };
    if (options?.name !== undefined) body.name = options.name;
    if (options?.selfProvisioningDomains !== undefined) {
      body.selfProvisioningDomains = options.selfProvisioningDomains;
    }
    if (options?.customAttributes !== undefined) body.customAttributes = options.customAttributes;
    if (options?.authType !== undefined) body.authType = options.authType;
    if (options?.disabled !== undefined) body.disabled = options.disabled;
    if (options?.enforceSSO !== undefined) body.enforceSSO = options.enforceSSO;
    if (options?.enforceSSOExclusions !== undefined) {
      body.enforceSSOExclusions = options.enforceSSOExclusions;
    }
    if (options?.federatedAppIds !== undefined) body.federatedAppIds = options.federatedAppIds;
    if (options?.roleInheritance !== undefined) body.roleInheritance = options.roleInheritance;

    return transformResponse(httpClient.patch(apiPaths.tenant.patch, body));
  },
  delete: (id: string, cascade?: boolean): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.tenant.delete, { id, cascade })),
  load: (id: string): Promise<SdkResponse<Tenant>> =>
    transformResponse<Tenant, Tenant>(
      httpClient.get(apiPaths.tenant.load, {
        queryParams: { id },
      }),
      (data) => data,
    ),
  loadAll: (): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      httpClient.get(apiPaths.tenant.loadAll, {}),
      (data) => data.tenants,
    ),
  searchAll: (
    ids?: string[],
    names?: string[],
    selfProvisioningDomains?: string[],
    customAttributes?: Record<string, AttributesTypes>,
    parentTenantId?: string,
  ): Promise<SdkResponse<Tenant[]>> =>
    transformResponse<MultipleTenantResponse, Tenant[]>(
      httpClient.post(apiPaths.tenant.searchAll, {
        tenantIds: ids,
        tenantNames: names,
        tenantSelfProvisioningDomains: selfProvisioningDomains,
        customAttributes,
        parentTenantId,
      }),
      (data) => data.tenants,
    ),
  getSettings: (tenantId: string): Promise<SdkResponse<TenantSettings>> =>
    transformResponse<TenantSettings, TenantSettings>(
      httpClient.get(apiPaths.tenant.settings, {
        queryParams: { id: tenantId },
      }),
      (data) => data,
    ),
  configureSettings: (tenantId: string, settings: TenantSettings): Promise<SdkResponse<never>> =>
    transformResponse(httpClient.post(apiPaths.tenant.settings, { ...settings, tenantId }, {})),
  generateSSOConfigurationLink: (
    tenantId: string,
    expireDuration: number,
    ssoId?: string,
    email?: string,
    templateId?: string,
    // When provided, actorId is recorded as the audit actor for actions performed inside the
    // SSO Setup Suite (instead of the temporary user). It is used as-is for audit attribution
    // and is not validated.
    actorId?: string,
  ): Promise<SdkResponse<GenerateSSOConfigurationLinkResponse>> =>
    transformResponse<GenerateSSOConfigurationLinkResponse, GenerateSSOConfigurationLinkResponse>(
      httpClient.post(
        apiPaths.tenant.generateSSOConfigurationLink,
        { tenantId, expireTime: expireDuration, ssoId, email, templateId, actorId },
        {},
      ),
      (data) => data,
    ),
  revokeSSOConfigurationLink: (tenantId: string, ssoId?: string): Promise<SdkResponse<never>> =>
    transformResponse(
      httpClient.post(
        apiPaths.tenant.revokeSSOConfigurationLink,
        { tenantId, ...(ssoId ? { ssoId } : {}) },
        {},
      ),
    ),
});

export interface PatchTenantOptions {
  name?: string;
  selfProvisioningDomains?: string[];
  customAttributes?: Record<string, unknown>;
  /** @deprecated kept for compatibility */
  authType?: string;
  disabled?: boolean;
  enforceSSO?: boolean;
  enforceSSOExclusions?: string[];
  federatedAppIds?: string[];
  roleInheritance?: string;
}

export default withTenant;
