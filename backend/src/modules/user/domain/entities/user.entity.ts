/**
 * @ai-context Pure domain entity. No framework dependencies.
 * Encapsulates user business rules and invariants.
 */
export type ThemePreference = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password?: string;
  isActive: boolean;
  themePreference: ThemePreference;
  roleId: string;
  roleName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  public static create(props: UserProps): UserEntity {
    // We could add business validation here. E.g. email regex, password strength, etc.
    return new UserEntity({
      ...props,
      isActive: props.isActive ?? true,
      themePreference: props.themePreference ?? 'SYSTEM',
    });
  }

  public static restore(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // Getters for read-only access to encapsulate state
  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get email(): string {
    return this.props.email;
  }
  get password(): string | undefined {
    return this.props.password;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get themePreference(): ThemePreference {
    return this.props.themePreference;
  }
  get roleId(): string {
    return this.props.roleId;
  }
  get roleName(): string | undefined {
    return this.props.roleName;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Actions representing state changes (Business Rules)
  public deactivate(): void {
    this.props.isActive = false;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public changeTheme(theme: ThemePreference): void {
    this.props.themePreference = theme;
  }
}
