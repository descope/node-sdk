import { CoreSdk } from '../types';
import withUser from './user';
import withTenant from './tenant';
import withJWT from './jwt';
import withPermission from './permission';
import withRole from './role';
import withGroup from './group';
import withSSOSettings from './sso';

/** Constructs a higher level Management API that wraps the functions from code-js-sdk */
const withManagement = (sdk: CoreSdk, managementKey?: string) => ({
  user: withUser(sdk, managementKey),
  tenant: withTenant(sdk, managementKey),
  sso: withSSOSettings(sdk, managementKey),
  jwt: withJWT(sdk, managementKey),
  permission: withPermission(sdk, managementKey),
  role: withRole(sdk, managementKey),
  group: withGroup(sdk, managementKey),
});

export default withManagement;
