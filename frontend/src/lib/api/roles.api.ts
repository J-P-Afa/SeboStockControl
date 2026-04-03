import { api } from './client';
import { Role, Permission, CreateRoleData, UpdateRoleData } from '@/types';

export const rolesApi = {
    list: async () => {
        const response = await api.get<Role[]>('/roles');
        return response.data;
    },

    listPermissions: async () => {
        const response = await api.get<Permission[]>('/roles/permissions');
        return response.data;
    },

    create: async (data: CreateRoleData) => {
        const response = await api.post<Role>('/roles', data);
        return response.data;
    },

    update: async (id: string, data: UpdateRoleData) => {
        const response = await api.patch<Role>(`/roles/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/roles/${id}`);
    },
};
