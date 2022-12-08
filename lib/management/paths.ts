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
  },
  jwt: {
    update: '/v1/mgmt/jwt/update',
  },
};
