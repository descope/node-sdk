# Family Accounts Example

Walks through the Descope family account management API end to end: family settings, family and
family-scoped custom attribute definitions, creating, updating and searching families, adding a
guardian to a family, creating a dependent (a user with no login credentials of their own),
searching users by family, impersonating a dependent, and removing a family member.

Everything the script creates is named with a per-run suffix and deleted at the end, and the
project's original family settings are restored. Run it against a development project.

## Prerequisites

- A Descope project and a management key for it
- Node.js 18 or later

## Run

Build the SDK from the repo root, then install and run the example:

```bash
npm install && npm run build
cd examples/families
npm install

export DESCOPE_PROJECT_ID=<your-project-id>
export DESCOPE_MANAGEMENT_KEY=<your-management-key>

npm start
```

## Options

| Variable           | Description                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `DESCOPE_BASE_URL` | Override the Descope API base URL, for example when using a custom domain.                                       |
| `FAMILY_ROLE`      | The guardian's role in the family. Defaults to `Family Admin`.                                                   |
| `SKIP_CLEANUP=1`   | Keep everything the run created, including the guardian's membership, and print the IDs so you can inspect them. |

The impersonation step requires the guardian's role to hold the `Family Impersonate Dependents`
permission. `Family Admin`, the default family role Descope creates when family accounts are
enabled, includes it. If you set `FAMILY_ROLE`, make sure that role has the permission too.

With `SKIP_CLEANUP=1`, delete the created family, users and attribute definitions yourself when you
are done, and restore your family settings if needed.
