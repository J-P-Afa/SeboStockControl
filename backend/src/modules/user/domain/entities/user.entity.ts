/**
 * @ai-context Pure domain entity. No framework dependencies.
 * Encapsulates user business rules and invariants.
 */
export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface UserEntity {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly isActive: boolean;
  readonly themePreference: ThemePreference;
  readonly roleId: string;
  readonly roleName?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
