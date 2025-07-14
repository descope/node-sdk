/* eslint-disable import/prefer-default-export */
import { User } from './types';

/**
 * Transforms user objects by converting roles to roleNames
 */
export function transformUsersForBatch(users: User[]): any[] {
  return users.map((u) => {
    const res = {
      ...u,
      roleNames: u.roles,
    };
    delete res.roles;
    return res;
  });
}
