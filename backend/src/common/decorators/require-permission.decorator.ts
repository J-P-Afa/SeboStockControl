import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * @ai-context Marks an endpoint with the required permission action string.
 * Works in tandem with PermissionsGuard to enforce RBAC.
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
