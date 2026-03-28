export interface GenreProps {
  id?: number;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class GenreEntity {
  private props: GenreProps;

  private constructor(props: GenreProps) {
    this.props = props;
  }

  public static create(
    props: Omit<GenreProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): GenreEntity {
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('Nome do gênero é obrigatório');
    }

    return new GenreEntity({
      ...props,

      isActive: props.isActive ?? true,
    });
  }

  public static restore(props: GenreProps): GenreEntity {
    return new GenreEntity(props);
  }

  get id(): number | undefined {
    return this.props.id;
  }
  get description(): string {
    return this.props.description;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public toJSON(): GenreProps {
    return this.props;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Invalid description');
    }

    this.props.description = description;
  }
}
