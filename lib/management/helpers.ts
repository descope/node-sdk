/* eslint-disable import/prefer-default-export */
import { User } from './types';

/**
 * Transforms user objects by converting roles to roleNames
 */
export function transformUsersForBatch(users: User[]): any[] {
  return users.map(({ loginIdOrUserId, roles, ...user }) => ({
    ...user,
    loginId: loginIdOrUserId,
    roleNames: roles,
  }));
}
