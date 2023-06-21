# validate tenant example

This example shows how to validate a tenant's permissions.

## Setup

1. Go to the example directory: `cd examples/validateTenant`
2. Install dependencies: `npm install`
3. Set env variables. this can be done with `.env` file or by setting the variables in the terminal.
   a. Using `.env` file. Create `.env` file and fill in the value:
   ```bash
    # Required
    DESCOPE_PROJECT_ID=YOUR_PROJECT_ID
    # Optional
    DESCOPE_BASE_URL=YOUR_BASE_URL
   ```
   b. Setting the variables in the terminal:
   ```bash
   export DESCOPE_PROJECT_ID=YOUR_PROJECT_ID
   export DESCOPE_BASE_URL=YOUR_BASE_URL # Optional
   ```

## Run the example

To run the example, `npm run start` from the example directory with the command/arguments.

```bash
# Help
$ npm run start help


$ npm run start -- validateTenantPermissions <session-token> <tenant> --permissions <permission1> <permission2> <permission3>
```
