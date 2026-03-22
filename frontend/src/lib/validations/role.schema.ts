import { z } from 'zod';

export const roleSchema = z.object({
    name: z.string().min(3, 'Nome do perfil deve ter no mínimo 3 caracteres'),
    permissionIds: z.array(z.string()).min(1, 'Selecione ao menos uma permissão'),
});

export type RoleFormData = z.infer<typeof roleSchema>;
