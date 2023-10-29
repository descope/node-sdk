import DescopeClient, { SdkResponse } from '@descope/node-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Command } from 'commander';

dotenv.config();

const DESCOPE_PROJECT_ID = process.env.DESCOPE_PROJECT_ID as string;
const DESCOPE_MANAGEMENT_KEY = process.env.DESCOPE_MANAGEMENT_KEY as string;
const DESCOPE_API_BASE_URL = (process.env.DESCOPE_API_BASE_URL as string) || undefined;

if (!DESCOPE_PROJECT_ID || !DESCOPE_MANAGEMENT_KEY) {
  console.error('Missing DESCOPE_PROJECT_ID or DESCOPE_MANAGEMENT_KEY environment variables');
  process.exit(1);
}

const sdk = DescopeClient({
  projectId: DESCOPE_PROJECT_ID,
  baseUrl: DESCOPE_API_BASE_URL,
  managementKey: DESCOPE_MANAGEMENT_KEY,
});

const program = new Command();

program.name('descope-management-cli').description('Descope Management CLI').version('0.9.0');

// *** User commands ***

// user-create
program
  .command('user-create')
  .description('Create a new user')
  .argument('<loginId>', 'Login ID')
  .option('-e, --email <email>', `User's email address`)
  .option('-p, --phone <phone>', `User's phone number`)
  .option('-n, --name <name>', `User's display name`)
  .option(
    '-t, --tenants <t1,t2>',
    `User's tenant IDs`,
    (val: string, memo: string[]) => {
      memo.push(val);
      return memo;
    },
    [],
  )
  .action(async (loginId, options) => {
    handleSdkRes(
      await sdk.management.user.create(
        loginId,
        options.email,
        options.phone,
        options.name,
        undefined,
        options.tenants?.map((tenantId: string) => ({ tenantId })),
      ),
    );
  });

// user-update
program
  .command('user-update')
  .description('Update a user')
  .argument('<login-id>', 'Login ID')
  .option('-e, --email <email>', `User's email address`)
  .option('-p, --phone <phone>', `User's phone number`)
  .option('-n, --name <name>', `User's display name`)
  .option(
    '-t, --tenants <t1,t2>',
    `User's tenant IDs`,
    (val: string, memo: string[]) => {
      memo.push(val);
      return memo;
    },
    [],
  )
  .action(async (loginId, options) => {
    handleSdkRes(
      await sdk.management.user.update(
        loginId,
        options.email,
        options.phone,
        options.name,
        undefined,
        options.tenants?.map((tenantId: string) => ({ tenantId })),
      ),
    );
  });

// user-delete
program
  .command('user-delete')
  .description('Delete a user')
  .argument('<login-id>', 'Login ID')
  .action(async (loginId) => {
    handleSdkRes(await sdk.management.user.delete(loginId));
  });

// user-update-login-id
program
  .command('user-update-login-id')
  .description('Update user login ID')
  .argument('<login-id>', 'Login ID')
  .argument('<new-login-id>', 'New Login ID')
  .action(async (loginId, newLoginId) => {
    handleSdkRes(await sdk.management.user.updateLoginId(loginId, newLoginId));
  });

// user-load
program
  .command('user-load')
  .description('Load a user')
  .argument('<login-id>', 'Login ID')
  .action(async (loginId) => {
    handleSdkRes(await sdk.management.user.load(loginId));
  });

// user-search-all
program
  .command('user-search-all')
  .description('Search for all users')
  .option('-l, --limit <limit>', 'Limit', '100')
  .option('-p, --page <page>', 'Page', '0')
  .action(async (options) => {
    handleSdkRes(
      await sdk.management.user.searchAll(
        [],
        [],
        parseInt(options.limit, 10),
        parseInt(options.page, 10),
      ),
    );
  });

// user-set-password
program
  .command('user-set-password')
  .description('Set a user password')
  .argument('<login-id>', 'Login ID')
  .argument('<password>', 'Password')
  .action(async (loginId, password) => {
    handleSdkRes(await sdk.management.user.setPassword(loginId, password));
  });

// user-expire-password
program
  .command('user-expire-password')
  .description('Expire a user password')
  .argument('<login-id>', 'Login ID')
  .action(async (loginId) => {
    handleSdkRes(await sdk.management.user.expirePassword(loginId));
  });

// user-provider-token
program
  .command('user-provider-token')
  .description('Get a user provider token')
  .argument('<login-id>', 'Login ID')
  .argument('<provider>', 'Provider name')
  .action(async (loginId, provider) => {
    handleSdkRes(await sdk.management.user.getProviderToken(loginId, provider));
  });

// *** Project commands ***

// project-update-name
program
  .command('project-update-name')
  .description('Update a project')
  .argument('<name>', 'Project name')
  .action(async (name) => {
    handleSdkRes(await sdk.management.project.updateName(name));
  });

// *** Access key commands ***

// access-key-create
program
  .command('access-key-create')
  .description('Create a new access key')
  .argument('<name>', 'Access key name')
  .argument('<expire-time>', 'Access key expiration time')
  .option(
    '-t, --tenants <t1,t2>',
    `Access key's tenant IDs`,
    (val: string, memo: string[]) => {
      memo.push(val);
      return memo;
    },
    [],
  )
  .action(async (name, expireTime, options) => {
    handleSdkRes(
      await sdk.management.accessKey.create(
        name,
        expireTime,
        undefined,
        options.tenants?.map((tenantId: string) => ({ tenantId })),
      ),
    );
  });

// access-key-update
program
  .command('access-key-update')
  .description('Update an access key')
  .argument('<id>', 'Access key ID')
  .argument('<name>', 'Access key name')
  .action(async (id, name) => {
    handleSdkRes(await sdk.management.accessKey.update(id, name));
  });

// access-key-delete
program
  .command('access-key-delete')
  .description('Delete an access key')
  .argument('<id>', 'Access key ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.accessKey.delete(id));
  });

// access-key-load
program
  .command('access-key-load')
  .description('Load an access key')
  .argument('<id>', 'Access key ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.accessKey.load(id));
  });

// access-key-search-all
program
  .command('access-key-search-all')
  .description('Search for all access keys')
  .action(async () => {
    handleSdkRes(await sdk.management.accessKey.searchAll());
  });

// access-key-deactivate
program
  .command('access-key-deactivate')
  .description('Deactivate an access key')
  .argument('<id>', 'Access key ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.accessKey.deactivate(id));
  });

// access-key-activate
program
  .command('access-key-activate')
  .description('Activate an access key')
  .argument('<id>', 'Access key ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.accessKey.activate(id));
  });

// *** Tenant commands ***

// tenant-create
program
  .command('tenant-create')
  .description('Create a new tenant')
  .argument('<name>', 'Tenant name')
  .action(async (name) => {
    handleSdkRes(await sdk.management.tenant.create(name));
  });

// tenant-update
program
  .command('tenant-update')
  .description('Update a tenant')
  .argument('<id>', 'Tenant ID')
  .argument('<name>', 'Tenant name')
  .action(async (id, name) => {
    handleSdkRes(await sdk.management.tenant.update(id, name));
  });

// tenant-delete
program
  .command('tenant-delete')
  .description('Delete a tenant')
  .argument('<id>', 'Tenant ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.tenant.delete(id));
  });

// tenant-load
program
  .command('tenant-load')
  .description('Load tenant by id')
  .argument('<id>', 'Tenant ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.tenant.load(id));
  });

// tenant-all
program
  .command('tenant-all')
  .description('Load for all tenants')
  .action(async () => {
    handleSdkRes(await sdk.management.tenant.loadAll());
  });

// *** Group commands ***

// group-all-for-tenant
program
  .command('group-all-for-tenant')
  .description('Load all groups for a given tenant id')
  .argument('<tenant-id>', 'Tenant ID')
  .action(async (tenantId) => {
    handleSdkRes(await sdk.management.group.loadAllGroups(tenantId));
  });

// group-all-for-member
program
  .command('group-all-for-member')
  .description('Load for all groups for a list of user IDs or login IDs')
  .argument('<tenant-id>', 'Tenant ID')
  .option('--user-ids <items>', 'User IDs', (val) => val?.split(','))
  .option('--login-ids', 'Login IDs', (val) => val?.split(','))
  .action(async (tenantId: string, options) => {
    handleSdkRes(
      await sdk.management.group.loadAllGroupsForMember(
        tenantId,
        options.userIds,
        options.loginIds,
      ),
    );
  });

// group-members
program
  .command('group-members')
  .description(`Load all group's members by the given group id`)
  .argument('tenant-id', 'Tenant ID')
  .argument('<group-id>', 'Group ID')
  .action(async (tenantId, groupId) => {
    handleSdkRes(await sdk.management.group.loadAllGroupMembers(tenantId, groupId));
  });

// *** Permission commands ***

// permission-create
program
  .command('permission-create')
  .description('Create a new permission')
  .argument('<name>', 'Permission name')
  .action(async (name) => {
    handleSdkRes(await sdk.management.permission.create(name));
  });

// permission-update
program
  .command('permission-update')
  .description('Update a permission')
  .argument('<id>', 'Permission ID')
  .argument('<name>', 'Permission name')
  .action(async (id, name) => {
    handleSdkRes(await sdk.management.permission.update(id, name));
  });

// permission-delete
program
  .command('permission-delete')
  .description('Delete a permission')
  .argument('<id>', 'Permission ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.permission.delete(id));
  });

// permission-all
program
  .command('permission-all')
  .description('Load for all permissions')
  .action(async () => {
    handleSdkRes(await sdk.management.permission.loadAll());
  });

// *** Role commands ***

// role-create
program
  .command('role-create')
  .description('Create a new role')
  .argument('<name>', 'Role name')
  .option(
    '-p, --permissions <p1,p2>',
    `Role's permission IDs`,
    (val: string, memo: string[]) => {
      memo.push(val);
      return memo;
    },
    [],
  )
  .action(async (name, options) => {
    handleSdkRes(await sdk.management.role.create(name, options.permissions));
  });

// role-update
program
  .command('role-update')
  .description('Update a role')
  .argument('<id>', 'Role ID')
  .argument('<name>', 'Role name')
  .option(
    '-p, --permissions <p1,p2>',
    `Role's permission IDs`,
    (val: string, memo: string[]) => {
      memo.push(val);
      return memo;
    },
    [],
  )
  .action(async (id, name, options) => {
    handleSdkRes(await sdk.management.role.update(id, name, options.permissions));
  });

// role-delete
program
  .command('role-delete')
  .description('Delete a role')
  .argument('<id>', 'Role ID')
  .action(async (id) => {
    handleSdkRes(await sdk.management.role.delete(id));
  });

// role-all
program
  .command('role-all')
  .description('Load for all roles')
  .action(async () => {
    handleSdkRes(await sdk.management.role.loadAll());
  });

// *** Flows commands ***
// flows-list
program
  .command('flows-list')
  .description('List all project flows')
  .action(async () => {
    handleSdkRes(await sdk.management.flow.list());
  });
// flow-export
program
  .command('flow-export')
  .description('Export a flow')
  .argument('<id>', 'Flow ID')
  .option('-o, --output <filename>', 'Output filename')
  .action(async (id, options) => {
    handleSdkRes(await sdk.management.flow.export(id), options.output);
  });

// flow-import
program
  .command('flow-import')
  .description('Import a flow')
  .argument('<flow-id>', 'Flow ID')
  .argument('<filename>', 'Flow filename')
  .action(async (flowId, filename) => {
    // read file
    const content = await fs.readFileSync(filename, 'utf8');

    const { flow, screens } = JSON.parse(content);
    if (!flow || !screens) {
      console.error('Invalid file content');
      return;
    }
    handleSdkRes(await sdk.management.flow.import(flowId, flow, screens));
  });

// *** Theme commands ***

// export-theme
program
  .command('theme-export')
  .description('Export a theme')
  .option('-o, --output <filename>', 'Output filename')
  .action(async (option) => {
    handleSdkRes(await sdk.management.theme.export(), option.output);
  });

// import-theme
program
  .command('theme-import')
  .description('Import a theme')
  .argument('<filename>', 'Theme filename')
  .action(async (filename) => {
    // read file
    const content = fs.readFileSync(filename, 'utf8');
    const theme = JSON.parse(content);
    if (!theme) {
      console.error('Invalid file content');
      return;
    }
    handleSdkRes(await sdk.management.theme.import(theme));
  });

// *** Audit commands ***

// search
program
  .command('audit-search')
  .description('Search audit trail up to the last 30 days')
  .argument('<text>', 'Search for the text in all relevant fields')
  .option('-o, --output <filename>', 'Output filename')
  .action(async (text, option) => {
    handleSdkRes(await sdk.management.audit.search({ text }), option.output);
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
