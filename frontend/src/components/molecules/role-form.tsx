"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, type RoleFormData } from "@/lib/validations/role.schema";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Checkbox } from "@/components/atoms/checkbox";
import { Permission } from "@/types";
import { cn } from "@/lib/utils";

interface RoleFormProps {
    initialData?: Partial<RoleFormData>;
    permissions: Permission[];
    onSubmit: (data: RoleFormData) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

export function RoleForm({
    initialData,
    permissions,
    onSubmit,
    isLoading,
    onCancel,
}: RoleFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: initialData?.name || "",
            permissionIds: initialData?.permissionIds || [],
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const selectedPermissions = watch("permissionIds");

    const handleTogglePermission = useCallback((id: string) => {
        const current = getValues("permissionIds");
        const next = current.includes(id)
            ? current.filter(item => item !== id)
            : [...current, id];
        setValue("permissionIds", next, { shouldValidate: true });
    }, [getValues, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground/80">Nome do Perfil</Label>
                <Input
                    id="name"
                    placeholder="Ex: Gerente de Estoque"
                    {...register("name")}
                    className={cn(
                        "bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground/50 focus:ring-primary/50",
                        errors.name && "border-destructive/50 focus:ring-destructive/50"
                    )}
                />
                {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-3">
                <Label className="text-foreground/80">Permissões</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 rounded-lg bg-foreground/5 border border-border/50 custom-scrollbar">
                    {permissions.map((permission) => (
                        <PermissionItem
                            key={permission.id}
                            permission={permission}
                            isSelected={selectedPermissions.includes(permission.id)}
                            onToggle={handleTogglePermission}
                        />
                    ))}
                </div>
                {errors.permissionIds && (
                    <p className="text-xs text-destructive mt-1">{errors.permissionIds.message}</p>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                >
                    {isLoading ? "Salvando..." : initialData ? "Atualizar Perfil" : "Criar Perfil"}
                </Button>
            </div>
        </form>
    );
}

function PermissionItem({
    permission,
    isSelected,
    onToggle,
}: {
    permission: Permission;
    isSelected: boolean;
    onToggle: (id: string) => void;
}) {
    return (
        <label
            className={cn(
                "flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                isSelected
                    ? "bg-primary/20 border-primary/40 text-foreground"
                    : "bg-background/50 border-border/30 text-muted-foreground hover:bg-accent"
            )}
        >
            <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(permission.id)}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{permission.description || permission.action}</span>
                {permission.description && (
                    <span className="text-[10px] opacity-70">{permission.action}</span>
                )}
            </div>
        </label>
    );
}
