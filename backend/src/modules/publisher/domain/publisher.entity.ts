export interface PublisherProps {
  id?: number;
  description: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PublisherEntity {
  private props: PublisherProps;

  private constructor(props: PublisherProps) {
    this.props = props;
  }

  public static create(
    props: Omit<PublisherProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): PublisherEntity {
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('Nome da publisher é obrigatório');
    }

    return new PublisherEntity({
      ...props,
      isActive: props.isActive ?? true,
    });
  }

  public static restore(props: PublisherProps): PublisherEntity {
    return new PublisherEntity(props);
  }

  get id(): number | undefined {return this.props.id;}
  get description(): string {return this.props.description;}
  get isActive(): boolean {return this.props.isActive;}
  get createdAt(): Date | undefined {return this.props.createdAt;}
  get updatedAt(): Date | undefined {return this.props.updatedAt;}

  public toJSON(): PublisherProps {
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
