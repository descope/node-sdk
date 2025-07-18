import { CoreSdk } from '../types';
import withUser from './user';
import withProject from './project';
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
import WithAuthz from './authz';
import withSSOApplication from './ssoapplication';
import withPassword from './password';
import WithFGA from './fga';
import withInboundApplication from './inboundapplication';
import withOutboundApplication from './outboundapplication';

/** Constructs a higher level Management API that wraps the functions from code-js-sdk */
const withManagement = (sdk: CoreSdk, managementKey?: string) => ({
  user: withUser(sdk, managementKey),
  project: withProject(sdk, managementKey),
  accessKey: withAccessKey(sdk, managementKey),
  tenant: withTenant(sdk, managementKey),
  ssoApplication: withSSOApplication(sdk, managementKey),
  inboundApplication: withInboundApplication(sdk, managementKey),
  outboundApplication: withOutboundApplication(sdk, managementKey),
  sso: withSSOSettings(sdk, managementKey),
  jwt: withJWT(sdk, managementKey),
  permission: withPermission(sdk, managementKey),
  password: withPassword(sdk, managementKey),
  role: withRole(sdk, managementKey),
  group: withGroup(sdk, managementKey),
  flow: WithFlow(sdk, managementKey),
  theme: WithTheme(sdk, managementKey),
  audit: WithAudit(sdk, managementKey),
  authz: WithAuthz(sdk, managementKey),
  fga: WithFGA(sdk, managementKey),
});

export default withManagement;
