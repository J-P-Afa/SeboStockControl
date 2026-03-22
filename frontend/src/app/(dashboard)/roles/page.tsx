"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api";
import { RolesTable } from "@/components/organisms/roles-table";
import { RoleForm } from "@/components/molecules/role-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/molecules/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/molecules/alert-dialog";
import { Button } from "@/components/atoms/button";
import { Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Role, RoleFormData } from "@/types";

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    // Queries
    const { data: roles = [], isLoading: isRolesLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: rolesApi.list,
    });

    const { data: permissions = [] } = useQuery({
        queryKey: ["permissions"],
        queryFn: rolesApi.listPermissions,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: rolesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Perfil criado com sucesso!");
            setIsFormOpen(false);
        },
        onError: () => toast.error("Erro ao criar perfil."),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: RoleFormData }) =>
            rolesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Perfil atualizado com sucesso!");
            setIsFormOpen(false);
            setEditingRole(null);
        },
        onError: () => toast.error("Erro ao atualizar perfil."),
    });

    const deleteMutation = useMutation({
        mutationFn: rolesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Perfil excluído com sucesso!");
            setDeletingRole(null);
        },
        onError: () => toast.error("Erro ao excluir perfil."),
    });

    // Handlers
    const handleOpenCreate = () => {
        setEditingRole(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role);
        setIsFormOpen(true);
    };

    const handleSubmit = (data: RoleFormData) => {
        if (editingRole) {
            updateMutation.mutate({ id: editingRole.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gerenciar Perfis</h1>
                        <div className="p-1 rounded bg-primary/20 text-primary border border-primary/20">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        Configure funções e níveis de acesso para os usuários do sistema.
                    </p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-sm shadow-primary/5 hover:shadow-primary/10 group"
                >
                    <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
                    Novo Perfil
                </Button>
            </div>

            {/* Main Table */}
            <RolesTable
                roles={roles}
                onEdit={handleOpenEdit}
                onDelete={setDeletingRole}
                isLoading={isRolesLoading}
            />

            {/* Create/Edit Modal */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[550px] bg-card/90 backdrop-blur-2xl border-border text-foreground shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            {editingRole ? "Editar Perfil" : "Novo Perfil"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {editingRole
                                ? "Atualize o nome e as permissões deste perfil."
                                : "Defina um nome e selecione as permissões para o novo perfil."
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <RoleForm
                        initialData={editingRole ? {
                            name: editingRole.name,
                            permissionIds: editingRole.permissions.map(p => p.id)
                        } : undefined}
                        permissions={permissions}
                        onSubmit={handleSubmit}
                        isLoading={createMutation.isPending || updateMutation.isPending}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
                <AlertDialogContent className="bg-card/90 backdrop-blur-2xl border-border text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Perfil?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Esta ação não pode ser desfeita. O perfil <strong>{deletingRole?.name}</strong> será permanentemente removido e usuários vinculados a ele podem perder acesso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-accent/50 border-border text-foreground hover:bg-accent">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
                            className="bg-destructive hover:bg-destructive/80 text-destructive-foreground"
                        >
                            {deleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
