/* eslint-disable no-console */
/**
 * End-to-end walkthrough of the family account management API.
 *
 * Creates throwaway attribute definitions, a family, a guardian and a dependent, exercises every
 * family endpoint, then deletes everything it created and restores the original family settings.
 *
 * Run (see README.md):
 *   DESCOPE_PROJECT_ID=... DESCOPE_MANAGEMENT_KEY=... npm start
 *
 * Optional:
 *   SKIP_CLEANUP=1 - keep everything the run created (and the guardian's membership) for inspection.
 *   DESCOPE_BASE_URL - override the Descope API base URL (e.g. for a custom domain).
 *   FAMILY_ROLE - the guardian's role in the family. Defaults to "Family Admin", the default family
 *                 role Descope creates when family accounts are enabled. A different role needs the
 *                 "Family Impersonate Dependents" permission for the impersonation step to pass.
 */
import DescopeClient from '@descope/node-sdk';
import type { ResponseData, SdkResponse } from '@descope/node-sdk';

const { DESCOPE_PROJECT_ID, DESCOPE_MANAGEMENT_KEY, DESCOPE_BASE_URL } = process.env;
// The default family role; it carries the "Family Impersonate Dependents" permission that
// impersonateDependent requires
const guardianRole = process.env.FAMILY_ROLE || 'Family Admin';
// Keep everything the run created so it can be inspected in the console afterwards
const skipCleanup = process.env.SKIP_CLEANUP === '1';

if (!DESCOPE_PROJECT_ID || !DESCOPE_MANAGEMENT_KEY) {
  console.error('Missing DESCOPE_PROJECT_ID or DESCOPE_MANAGEMENT_KEY environment variables');
  process.exit(1);
}

const descopeClient = DescopeClient({
  projectId: DESCOPE_PROJECT_ID,
  managementKey: DESCOPE_MANAGEMENT_KEY,
  baseUrl: DESCOPE_BASE_URL || undefined,
});
const { family, user } = descopeClient.management;

// Unique suffix so reruns and parallel runs don't collide
const run = Date.now().toString(36);
const familyAttr = `plan_${run}`;
const familyScopedAttr = `nickname_${run}`;
const guardianLoginId = `guardian-${run}@example.com`;

/** Family membership details included on user responses */
type FamilyUserFields = {
  dependent?: boolean;
  userFamilies?: { familyId: string; roleNames?: string[]; familyScopedAttributes?: object }[];
};

/** Unwraps an SdkResponse, printing the result, and throws on failure. */
async function step<T extends ResponseData>(
  name: string,
  call: Promise<SdkResponse<T>>,
): Promise<T> {
  const res = await call;
  if (!res.ok) {
    throw new Error(`${name} failed: ${JSON.stringify(res.error)}`);
  }
  console.log(`\n✔ ${name}`);
  if (res.data !== undefined) console.dir(res.data, { depth: 5 });
  return res.data as T;
}

/** Same as step, but a failure is logged and swallowed (used for cleanup and optional steps). */
async function tryStep<T extends ResponseData>(
  name: string,
  call: Promise<SdkResponse<T>>,
): Promise<T | undefined> {
  try {
    return await step(name, call);
  } catch (e) {
    console.warn(`\n✘ ${(e as Error).message}`);
    return undefined;
  }
}

async function main() {
  // --- Settings ---------------------------------------------------------------------------------
  const originalSettings = await step('family.getSettings', family.getSettings());
  await step(
    'family.setSettings (enable families)',
    family.setSettings({ enabled: true, allowMultipleFamiliesUsers: true }),
  );

  let familyId: string | undefined;
  let dependentUserId: string | undefined;
  let guardianCreated = false;
  let familyAttrCreated = false;
  let familyScopedAttrCreated = false;

  try {
    // --- Attribute definitions --------------------------------------------------------------------
    // type 1 = text. Family attributes live on the family entity; family-scoped attributes are user
    // attributes whose values are stored per family membership.
    await step(
      'family.createCustomAttributes',
      family.createCustomAttributes([{ name: familyAttr, type: 1, displayName: 'Plan' }]),
    );
    familyAttrCreated = true;
    await step('family.getCustomAttributes', family.getCustomAttributes());

    await step(
      'user.createFamilyScopedCustomAttributes',
      user.createFamilyScopedCustomAttributes([
        { name: familyScopedAttr, type: 1, displayName: 'Nickname' },
      ]),
    );
    familyScopedAttrCreated = true;
    await step('user.getFamilyScopedCustomAttributes', user.getFamilyScopedCustomAttributes());

    // --- Family CRUD ------------------------------------------------------------------------------
    const created = await step(
      'family.create',
      family.create(`Demo Family ${run}`, { [familyAttr]: 'free' }),
    );
    familyId = created.id;

    await step(
      'family.update (rename + change attribute)',
      family.update(familyId, `Demo Family ${run} (renamed)`, { [familyAttr]: 'premium' }),
    );
    await step('family.search by id', family.search({ familyIds: [familyId] }));
    await step(
      'family.search by custom attribute',
      family.search({
        customAttributes: { [familyAttr]: 'premium' },
      }),
    );

    // --- Guardian (regular member) ----------------------------------------------------------------
    // A user can be created straight into a family, or added later via user.addFamilies.
    await step(
      'user.create (guardian, created into the family)',
      user.create(guardianLoginId, {
        email: guardianLoginId,
        displayName: 'Demo Guardian',
        familyAssociations: [
          {
            familyId,
            roleNames: [guardianRole],
            familyScopedAttributes: { [familyScopedAttr]: 'Mom' },
          },
        ],
      }),
    );
    guardianCreated = true;

    // addFamilies on a family the user already belongs to merges - here it updates the nickname only
    const guardian = await step(
      'user.addFamilies (update family-scoped attribute)',
      user.addFamilies(guardianLoginId, [
        { familyId, familyScopedAttributes: { [familyScopedAttr]: 'Mommy' } },
      ]),
    );
    console.log('  guardian.userFamilies ->', (guardian as FamilyUserFields).userFamilies);

    // --- Dependent (shadow profile, no credentials) -----------------------------------------------
    const dependent = await step(
      'family.createDependent',
      family.createDependent(familyId, {
        name: `Demo Kid ${run}`,
        givenName: 'Demo',
        familyScopedAttributes: { [familyId]: { [familyScopedAttr]: 'Kiddo' } },
      }),
    );
    dependentUserId = dependent.userId;
    console.log('  dependent.dependent ->', (dependent as FamilyUserFields).dependent);

    // --- Search users by family -------------------------------------------------------------------
    const members = await step(
      'user.search (all family members)',
      user.search({ familyIds: [familyId] }),
    );
    console.log(
      '  member login IDs ->',
      members.users.map((u) => u.loginIds),
    );
    await step(
      'user.search (dependents only)',
      user.search({ familyIds: [familyId], dependent: true }),
    );

    // --- Impersonation ----------------------------------------------------------------------------
    // The guardian acts as family admin through guardianRole's impersonate-dependents permission
    const impersonation = await step(
      'family.impersonateDependent',
      family.impersonateDependent(guardianLoginId, dependent.loginIds[0], familyId),
    );
    await step('family.stopImpersonation', family.stopImpersonation(impersonation.jwt));

    // --- Membership removal -----------------------------------------------------------------------
    // Kept when skipping cleanup, so the family shows both the guardian and the dependent
    if (!skipCleanup) {
      await step(
        'user.removeFamilies (guardian)',
        user.removeFamilies(guardianLoginId, [familyId]),
      );
    }
  } finally {
    if (skipCleanup) {
      console.log('\n--- SKIP_CLEANUP=1, left in place ---');
      console.dir(
        {
          familyId,
          familyAttribute: familyAttrCreated ? familyAttr : undefined,
          familyScopedUserAttribute: familyScopedAttrCreated ? familyScopedAttr : undefined,
          guardianLoginId: guardianCreated ? guardianLoginId : undefined,
          dependentUserId,
          originalSettings,
        },
        { depth: 3 },
      );
      return;
    }

    // --- Cleanup, reverse order -------------------------------------------------------------------
    console.log('\n--- cleanup ---');
    if (dependentUserId)
      await tryStep('family.deleteDependent', family.deleteDependent(dependentUserId));
    if (guardianCreated) await tryStep('user.delete (guardian)', user.delete(guardianLoginId));
    if (familyId) await tryStep('family.delete', family.delete(familyId));
    if (familyScopedAttrCreated) {
      await tryStep(
        'user.deleteFamilyScopedCustomAttributes',
        user.deleteFamilyScopedCustomAttributes([familyScopedAttr]),
      );
    }
    if (familyAttrCreated) {
      await tryStep('family.deleteCustomAttributes', family.deleteCustomAttributes([familyAttr]));
    }
    await tryStep('family.setSettings (restore original)', family.setSettings(originalSettings));
  }
}

main().catch((e) => {
  console.error(`\n✘ ${e.message}`);
  process.exit(1);
});
