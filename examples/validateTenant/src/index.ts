import DescopeClient, { SdkResponse } from '@descope/node-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Command } from 'commander';

dotenv.config();

const DESCOPE_PROJECT_ID = process.env.DESCOPE_PROJECT_ID as string;
const DESCOPE_API_BASE_URL = (process.env.DESCOPE_API_BASE_URL as string) || undefined;

if (!DESCOPE_PROJECT_ID) {
  console.error('Missing DESCOPE_PROJECT_ID environment variable');
  process.exit(1);
}

const sdk = DescopeClient({
  projectId: DESCOPE_PROJECT_ID,
  baseUrl: DESCOPE_API_BASE_URL,
});

const program = new Command();

program.name('descope-validate-tenant').description('Descope Validate Tenant CLI').version('0.9.0');

// *** User commands ***

// user-create
program
  .command('validateTenantPermissions')
  .description('Create a new user')
  .argument('<sessionToken>', 'Login ID')
  .argument('<tenant>', 'Tenant ID')
  .option('--permissions <items>', 'Permissions', (val) => val?.split(','))
  .action(async (sessionToken, tenant, options) => {
    const { permissions } = options;
    console.log('starting with', {
      sessionToken: sessionToken.substr(0, 5),
      tenant,
      permissions,
    });
    const authenticationInfo = await sdk.validateSession(sessionToken);

    console.log('@@@ authenticationInfo', authenticationInfo);
    const res = sdk.validateTenantPermissions(authenticationInfo, tenant, permissions);

    console.log('validateTenantPermissions response', res);
  });

// *** Helper functions ***

function handleSdkRes(res: SdkResponse<any>, responseFile?: string) {
  if (res.ok) {
    if (responseFile) {
      console.log('Success. Response saved to:', responseFile);
      fs.writeFileSync(responseFile, JSON.stringify(res.data, null, 2));
    } else {
      console.log('Success. Response: ', res.data);
    }
  } else {
    console.error('Failure. Got error:', res.error);
  }
}

program.parse();
