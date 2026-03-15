/**
 * @ai-context Pure domain entity. No framework dependencies.
 * Encapsulates role business rules and invariants.
 */
export interface PermissionEntity {
    readonly id: string;
    readonly action: string;
    readonly description?: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export interface RoleEntity {
    readonly id: string;
    readonly name: string;
    readonly permissions: PermissionEntity[];
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
