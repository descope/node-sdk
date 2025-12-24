import { HttpClient } from '@descope/core-js-sdk';
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
import withDescoper from './descoper';

/** Constructs a higher level Management API that wraps the functions from code-js-sdk */
const withManagement = (client: HttpClient) => ({
  user: withUser(client),
  project: withProject(client),
  accessKey: withAccessKey(client),
  tenant: withTenant(client),
  ssoApplication: withSSOApplication(client),
  inboundApplication: withInboundApplication(client),
  outboundApplication: withOutboundApplication(client),
  sso: withSSOSettings(client),
  jwt: withJWT(client),
  permission: withPermission(client),
  password: withPassword(client),
  role: withRole(client),
  group: withGroup(client),
  flow: WithFlow(client),
  theme: WithTheme(client),
  audit: WithAudit(client),
  authz: WithAuthz(client),
  fga: WithFGA(client),
  descoper: withDescoper(client),
});

export default withManagement;
