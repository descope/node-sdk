/** API paths for the Descope service Management APIs */
export default {
  user: {
    create: '/v1/mgmt/user/create',
    createTestUser: '/v1/mgmt/user/create/test',
    createBatch: '/v1/mgmt/user/create/batch',
    update: '/v1/mgmt/user/update',
    patch: '/v1/mgmt/user/patch',
    delete: '/v1/mgmt/user/delete',
    deleteAllTestUsers: '/v1/mgmt/user/test/delete/all',
    load: '/v1/mgmt/user',
    logout: '/v1/mgmt/user/logout',
    search: '/v2/mgmt/user/search',
    searchTestUsers: '/v2/mgmt/user/search/test',
    getProviderToken: '/v1/mgmt/user/provider/token',
    updateStatus: '/v1/mgmt/user/update/status',
    updateLoginId: '/v1/mgmt/user/update/loginid',
    updateEmail: '/v1/mgmt/user/update/email',
    updatePhone: '/v1/mgmt/user/update/phone',
    updateDisplayName: '/v1/mgmt/user/update/name',
    updatePicture: '/v1/mgmt/user/update/picture',
    updateCustomAttribute: '/v1/mgmt/user/update/customAttribute',
    setRole: '/v1/mgmt/user/update/role/set',
    addRole: '/v2/mgmt/user/update/role/add',
    removeRole: '/v1/mgmt/user/update/role/remove',
    setSSOApps: '/v1/mgmt/user/update/ssoapp/set',
    addSSOApps: '/v1/mgmt/user/update/ssoapp/add',
    removeSSOApps: '/v1/mgmt/user/update/ssoapp/remove',
    addTenant: '/v1/mgmt/user/update/tenant/add',
    removeTenant: '/v1/mgmt/user/update/tenant/remove',
    setPassword: '/v1/mgmt/user/password/set', // Deprecated
    setTemporaryPassword: '/v1/mgmt/user/password/set/temporary',
    setActivePassword: '/v1/mgmt/user/password/set/active',
    expirePassword: '/v1/mgmt/user/password/expire',
    removeAllPasskeys: '/v1/mgmt/user/passkeys/delete',
    removeTOTPSeed: '/v1/mgmt/user/totp/delete',
    generateOTPForTest: '/v1/mgmt/tests/generate/otp',
    generateMagicLinkForTest: '/v1/mgmt/tests/generate/magiclink',
    generateEnchantedLinkForTest: '/v1/mgmt/tests/generate/enchantedlink',
    generateEmbeddedLink: '/v1/mgmt/user/signin/embeddedlink',
    generateSignUpEmbeddedLink: '/v1/mgmt/user/signup/embeddedlink',
    history: '/v1/mgmt/user/history',
  },
  project: {
    updateName: '/v1/mgmt/project/update/name',
    updateTags: '/v1/mgmt/project/update/tags',
    clone: '/v1/mgmt/project/clone',
    projectsList: '/v1/mgmt/projects/list',
    exportSnapshot: '/v1/mgmt/project/snapshot/export',
    importSnapshot: '/v1/mgmt/project/snapshot/import',
    validateSnapshot: '/v1/mgmt/project/snapshot/validate',
  },
  accessKey: {
    create: '/v1/mgmt/accesskey/create',
    load: '/v1/mgmt/accesskey',
    search: '/v1/mgmt/accesskey/search',
    update: '/v1/mgmt/accesskey/update',
    deactivate: '/v1/mgmt/accesskey/deactivate',
    activate: '/v1/mgmt/accesskey/activate',
    delete: '/v1/mgmt/accesskey/delete',
  },
  tenant: {
    create: '/v1/mgmt/tenant/create',
    update: '/v1/mgmt/tenant/update',
    delete: '/v1/mgmt/tenant/delete',
    load: '/v1/mgmt/tenant',
    settings: '/v1/mgmt/tenant/settings',
    loadAll: '/v1/mgmt/tenant/all',
    searchAll: '/v1/mgmt/tenant/search',
    generateSSOConfigurationLink: '/v2/mgmt/tenant/adminlinks/sso/generate',
  },
  ssoApplication: {
    oidcCreate: '/v1/mgmt/sso/idp/app/oidc/create',
    samlCreate: '/v1/mgmt/sso/idp/app/saml/create',
    oidcUpdate: '/v1/mgmt/sso/idp/app/oidc/update',
    samlUpdate: '/v1/mgmt/sso/idp/app/saml/update',
    delete: '/v1/mgmt/sso/idp/app/delete',
    load: '/v1/mgmt/sso/idp/app/load',
    loadAll: '/v1/mgmt/sso/idp/apps/load',
  },
  inboundApplication: {
    create: '/v1/mgmt/thirdparty/app/create',
    update: '/v1/mgmt/thirdparty/app/update',
    patch: '/v1/mgmt/thirdparty/app/patch',
    delete: '/v1/mgmt/thirdparty/app/delete',
    load: '/v1/mgmt/thirdparty/app/load',
    loadAll: '/v1/mgmt/thirdparty/apps/load',
    secret: '/v1/mgmt/thirdparty/app/secret',
    rotate: '/v1/mgmt/thirdparty/app/rotate',
  },
  inboundApplicationConsents: {
    delete: '/v1/mgmt/thirdparty/consents/delete',
    search: '/v1/mgmt/thirdparty/consents/search',
  },
  outboundApplication: {
    create: '/v1/mgmt/outbound/app/create',
    update: '/v1/mgmt/outbound/app/update',
    delete: '/v1/mgmt/outbound/app/delete',
    load: '/v1/mgmt/outbound/app',
    loadAll: '/v1/mgmt/outbound/apps',
    fetchToken: '/v1/mgmt/outbound/app/user/token/latest',
    fetchTokenByScopes: '/v1/mgmt/outbound/app/user/token',
    fetchTenantToken: '/v1/mgmt/outbound/app/tenant/token/latest',
    fetchTenantTokenByScopes: '/v1/mgmt/outbound/app/tenant/token',
  },
  sso: {
    settings: '/v1/mgmt/sso/settings',
    settingsNew: '/v1/mgmt/sso/settings/new',
    metadata: '/v1/mgmt/sso/metadata',
    mapping: '/v1/mgmt/sso/mapping',
    settingsv2: '/v2/mgmt/sso/settings',
    settingsAllV2: '/v2/mgmt/sso/settings/all',
    oidc: {
      configure: '/v1/mgmt/sso/oidc',
    },
    saml: {
      configure: '/v1/mgmt/sso/saml',
      metadata: '/v1/mgmt/sso/saml/metadata',
    },
  },
  jwt: {
    update: '/v1/mgmt/jwt/update',
    impersonate: '/v1/mgmt/impersonate',
    stopImpersonation: '/v1/mgmt/stop/impersonation',
    signIn: '/v1/mgmt/auth/signin',
    signUp: '/v1/mgmt/auth/signup',
    signUpOrIn: '/v1/mgmt/auth/signup-in',
    anonymous: '/v1/mgmt/auth/anonymous',
  },
  password: {
    settings: '/v1/mgmt/password/settings',
  },
  permission: {
    create: '/v1/mgmt/permission/create',
    update: '/v1/mgmt/permission/update',
    delete: '/v1/mgmt/permission/delete',
    loadAll: '/v1/mgmt/permission/all',
  },
  role: {
    create: '/v1/mgmt/role/create',
    update: '/v1/mgmt/role/update',
    delete: '/v1/mgmt/role/delete',
    loadAll: '/v1/mgmt/role/all',
    search: '/v1/mgmt/role/search',
  },
  flow: {
    list: '/v1/mgmt/flow/list',
    delete: '/v1/mgmt/flow/delete',
    export: '/v1/mgmt/flow/export',
    import: '/v1/mgmt/flow/import',
    run: '/v1/mgmt/flow/run',
  },
  theme: {
    export: '/v1/mgmt/theme/export',
    import: '/v1/mgmt/theme/import',
  },
  group: {
    loadAllGroups: '/v1/mgmt/group/all',
    loadAllGroupsForMember: '/v1/mgmt/group/member/all',
    loadAllGroupMembers: '/v1/mgmt/group/members',
  },
  audit: {
    search: '/v1/mgmt/audit/search',
    createEvent: '/v1/mgmt/audit/event',
  },
  authz: {
    schemaSave: '/v1/mgmt/authz/schema/save',
    schemaDelete: '/v1/mgmt/authz/schema/delete',
    schemaLoad: '/v1/mgmt/authz/schema/load',
    nsSave: '/v1/mgmt/authz/ns/save',
    nsDelete: '/v1/mgmt/authz/ns/delete',
    rdSave: '/v1/mgmt/authz/rd/save',
    rdDelete: '/v1/mgmt/authz/rd/delete',
    reCreate: '/v1/mgmt/authz/re/create',
    reDelete: '/v1/mgmt/authz/re/delete',
    reDeleteResources: '/v1/mgmt/authz/re/deleteresources',
    reDeleteResourceRelationsForResources: '/v1/mgmt/authz/re/deleteresourcesrelations',
    hasRelations: '/v1/mgmt/authz/re/has',
    who: '/v1/mgmt/authz/re/who',
    resource: '/v1/mgmt/authz/re/resource',
    targets: '/v1/mgmt/authz/re/targets',
    targetAll: '/v1/mgmt/authz/re/targetall',
    targetWithRelation: '/v1/mgmt/authz/re/targetwithrelation',
    getModified: '/v1/mgmt/authz/getmodified',
  },
  fga: {
    schema: '/v1/mgmt/fga/schema',
    relations: '/v1/mgmt/fga/relations',
    deleteRelations: '/v1/mgmt/fga/relations/delete',
    check: '/v1/mgmt/fga/check',
    resourcesLoad: '/v1/mgmt/fga/resources/load',
    resourcesSave: '/v1/mgmt/fga/resources/save',
  },
};
