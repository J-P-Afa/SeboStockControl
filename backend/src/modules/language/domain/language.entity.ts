export interface LanguageProps {
  id?: number;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class LanguageEntity {
  private props: LanguageProps;

  private constructor(props: LanguageProps) {
    this.props = props;
  }

  public static create(
    props: Omit<LanguageProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): LanguageEntity {
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('Nome do language é obrigatório');
    }

    return new LanguageEntity({
      ...props,
      isActive: props.isActive ?? true,
    });
  }

  public static restore(props: LanguageProps): LanguageEntity {
    return new LanguageEntity(props);
  }

  get id(): number | undefined {return this.props.id;}
  get description(): string {return this.props.description;}
  get isActive(): boolean {return this.props.isActive;}
  get createdAt(): Date | undefined {return this.props.createdAt;}
  get updatedAt(): Date | undefined {return this.props.updatedAt;}

  public toJSON(): LanguageProps {
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
