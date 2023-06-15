import { CoreSdk } from '../types';
import withUser from './user';
import withTenant from './tenant';
import withJWT from './jwt';
import withPermission from './permission';
import withRole from './role';
import withGroup from './group';
import withSSOSettings from './sso';
import withAccessKey from './accesskey';
import WithFlow from './flow';
import WithTheme from './theme';
import WithAudit from './audit';

/** Constructs a higher level Management API that wraps the functions from code-js-sdk */
const withManagement = (sdk: CoreSdk, managementKey?: string) => ({
  user: withUser(sdk, managementKey),
  accessKey: withAccessKey(sdk, managementKey),
  tenant: withTenant(sdk, managementKey),
  sso: withSSOSettings(sdk, managementKey),
  jwt: withJWT(sdk, managementKey),
  permission: withPermission(sdk, managementKey),
  role: withRole(sdk, managementKey),
  group: withGroup(sdk, managementKey),
  flow: WithFlow(sdk, managementKey),
  theme: WithTheme(sdk, managementKey),
  audit: WithAudit(sdk, managementKey),
});

export default withManagement;
