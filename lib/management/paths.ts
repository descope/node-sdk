/** API paths for the Descope service Management APIs */
export default {
  user: {
    create: '/v1/mgmt/user/create',
    update: '/v1/mgmt/user/update',
    delete: '/v1/mgmt/user/delete',
    load: '/v1/mgmt/user',
    search: '/v1/mgmt/user/search',
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
    loadAll: '/v1/mgmt/tenant/all',
  },
  sso: {
    configure: 'mgmt/sso/settings',
    metadata: 'mgmt/sso/metadata',
    mapping: 'mgmt/sso/mapping',
  },
  jwt: {
    update: '/v1/mgmt/jwt/update',
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
  },
  group: {
    loadAllGroups: '/v1/mgmt/group/all',
    loadAllGroupsForMember: '/v1/mgmt/group/member/all',
    loadAllGroupMembers: '/v1/mgmt/group/members',
  },
};
