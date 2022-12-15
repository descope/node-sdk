/** API paths for the Descope service Management APIs */
export default {
  user: {
    create: '/v1/mgmt/user/create',
    update: '/v1/mgmt/user/update',
    delete: '/v1/mgmt/user/delete',
    load: '/v1/mgmt/user/load',
    search: '/v1/mgmt/user/search',
  },
  tenant: {
    create: '/v1/mgmt/tenant/create',
    update: '/v1/mgmt/tenant/update',
    delete: '/v1/mgmt/tenant/delete',
    loadAll: '/v1/mgmt/tenant/all',
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
};
