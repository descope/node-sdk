# Management CLI Example

This example shows how to use the management API using the CLI.

Read the [management functions readme](https://github.com/descope/node-sdk/#management-functions) for more information.

## Setup

1. Go to the example directory: `cd examples/managementCli`
2. Install dependencies: `npm install`
3. Set env variables. this can be done with `.env` file or by setting the variables in the terminal.
   a. Using `.env` file. Create `.env` file and fill in the value:
   ```bash
    # Required
    DESCOPE_PROJECT_ID=YOUR_PROJECT_ID
    DESCOPE_MANAGEMENT_KEY=YOUR_MANAGEMENT_KEY
    # Optional
    DESCOPE_BASE_URL=YOUR_BASE_URL
   ```
   b. Setting the variables in the terminal:
   ```bash
   export DESCOPE_PROJECT_ID=YOUR_PROJECT_ID
   export DESCOPE_MANAGEMENT_KEY=YOUR_MANAGEMENT_KEY
   export DESCOPE_BASE_URL=YOUR_BASE_URL # Optional
   ```

## Run the example

To run the example, `npm run start` from the example directory with the desired command/arguments.

```bash
# Help
$ npm run start help

## Users ##

# Create a user
$ npm run start -- user-create <login-id> --email <my@domain.com> --name=<some-name>

# Invite a user
$ npm run start -- user-create <login-id> --email <my@domain.com> --name=<some-name> --template-options=k1=v1,k2=v2

# Update a user
$ npm run start -- user-update <login-id> --email <new@domain.com> --name=<new-name>

# Delete a user
$ npm run start -- user-delete <login-id>

# Load a user
$ npm run start -- user-load <login-id>

# Search users
$ npm run start -- user-search-all <limit> [<page>]

# Update custom attribute
$ npm run start -- user-update-custom-attribute <login-id> <attribute-name> <attribute-value>

# Create a test user
$ npm run start -- test-user-create <login-id> --email <my@domain.com> --name=<some-name> --verified-email

## Projects	##

# Update project name
$ npm run start -- project-update-name <project-name>

## Access Keys ##

# Create an access key
# The expiration time is a unix timestamp in seconds, you can use `date -v+3m +%s` to get a timestamp for 3 months from now
$ npm run start -- access-key-create <access-key-name> <access-key-expiration-time>

# Update an access key
$ npm run start -- access-key-update <access-key-id> <access-key-name>

# Delete an access key
$ npm run start -- access-key-delete <access-key-id>

# Load an access key
$ npm run start -- access-key-load <access-key-id>

# List access keys
$ npm run start -- access-key-search-all

# Deactivate an access key
$ npm run start -- access-key-deactivate <access-key-id>

# Activate an access key
$ npm run start -- access-key-activate <access-key-id>

## Tenant

# Create a tenant
$ npm run start -- tenant-create <tenant-name>

# Update a tenant
$ npm run start -- tenant-update <tenant-id> <tenant-name>

# Delete a tenant
$ npm run start -- tenant-delete <tenant-id>

# Load all tenants
$ npm run start -- tenant-all

## SSO application

# Create a OIDC sso application
$ npm run start -- sso-application-create-oidc <sso-application-name> <loginPageUrl>

# Create a SAML sso application
$ npm run start -- sso-application-create-oidc <sso-application-name> <loginPageUrl> <metadataUrl>

# Update a OIDC sso application
$ npm run start -- sso-application-update-oidc <sso-application-id> <sso-application-name> <loginPageUrl>

# Update a SAML sso application
$ npm run start -- sso-application-update-saml <sso-application-id> <sso-application-name> <loginPageUrl> <entityId> <acsUrl> <certificate>

# Delete an sso application
$ npm run start -- sso-application-delete <sso-application-id>

# Load specific sso applications
$ npm run start -- sso-application-load <sso-application-id>

# Load all sso applications
$ npm run start -- sso-application-all

## Groups

# Load all groups for a tenant
$ npm run start -- group-all-for-tenant <tenant-id>

# Load all groups for user ids
$ npm run start -- group-all-for-member [--user-ids <user-id-1> <user-id-2> <user-id-3>] [--login-ids <login-id-1> <login-id-2> <login-id-3>]

# Load all group's members by the given group id
$ npm run start -- group-members <tenant-id> <group-id>


## Permissions

# Create a permission
$ npm run start -- permission-create <permission-name>

# Update a permission
$ npm run start -- permission-update <permission-id> <permission-name>

# Delete a permission
$ npm run start -- permission-delete <permission-id>

# Load all permissions
$ npm run start -- permission-all

## Roles

# Create a role
$ npm run start -- role-create <role-name>

# Update a role
$ npm run start -- role-update <role-id> <role-name>

# Delete a role
$ npm run start -- role-delete <role-id>

# Load all roles
$ npm run start -- role-all

## Flows

# Export a flow
$ npm run start -- flow-export <flow-id> --output <output-file-path>

# Import a flow
$ npm run start -- flow-import <flow-file-path>

## Theme

# Export a theme
$ npm run start -- theme-export --output <output-file-path>

# Import a theme
$ npm run start -- theme-import <theme-file-path>

## FGA

# Save an FGA schema
$ npm run start -- fga-save-schema <schema-file-path>

# Create an FGA relations
$ npm run start -- fga-create-relations <relations-file-path>

# Create an FGA relation
$ npm run start -- fga-create-relation [--resource <resource>] [--resource-type <resource-type>] [--relation <relation>] [--target <target>] [--target-type <target-type>]

# Check FGA relations
$ npm run start -- fga-check-relations <relations-file-path>

# Check FGA relation
$ npm run start -- fga-check [--resource <resource>] [--resource-type <resource-type>] [--relation <relation>] [--target <target>] [--target-type <target-type>]
```
