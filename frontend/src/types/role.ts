export interface Permission {
    id: string;
    action: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleData {
    name: string;
    permissionIds: string[];
}

export interface UpdateRoleData {
    name?: string;
    permissionIds?: string[];
}

import { roleSchema } from '@/lib/validations/role.schema';
import { z } from 'zod';
export type RoleFormData = z.infer<typeof roleSchema>;
