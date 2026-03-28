import { api } from './client';
import { Role, Permission, CreateRoleData, UpdateRoleData, ApiResponse } from '@/types';

export const rolesApi = {
    list: async () => {
        const response = await api.get<ApiResponse<Role[]>>('/roles');
        return response.data.data;
    },

    listPermissions: async () => {
        const response = await api.get<ApiResponse<Permission[]>>('/roles/permissions');
        return response.data.data;
    },

    create: async (data: CreateRoleData) => {
        const response = await api.post<ApiResponse<Role>>('/roles', data);
        return response.data.data;
    },

    update: async (id: string, data: UpdateRoleData) => {
        const response = await api.patch<ApiResponse<Role>>(`/roles/${id}`, data);
        return response.data.data;
    },

    delete: async (id: string) => {
        await api.delete(`/roles/${id}`);
    },
};
