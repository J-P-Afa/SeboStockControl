import { Condition, Status, EditionType } from '@prisma/client';

export interface BookProps {
  id?: number;
  title: string;
  isbn13: string | null;
  isbn10: string | null;
  editionType: EditionType;
  volume: string | null;
  condition: Condition;
  status: Status;
  weight: number;
  publisherId: number;
  languageId: number;
  genreId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookEntity {
  private props: BookProps;

  private constructor(props: BookProps) {
    this.props = props;
  }

  public static create(
    props: Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>
  ): BookEntity {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Título é obrigatório');
    }

    if (props.weight <= 0) {
      throw new Error('Peso deve ser maior que 0');
    }

    return new BookEntity({
      ...props,
      isActive: props.isActive ?? true,
    });
  }

  public static restore(props: BookProps): BookEntity {
    return new BookEntity(props);
  }

  get id(): number | undefined { return this.props.id; }
  get title(): string { return this.props.title; }
  get isbn13(): string | null | undefined { return this.props.isbn13; }
  get isbn10(): string | null | undefined { return this.props.isbn10; }
  get editionType(): EditionType { return this.props.editionType; }
  get volume(): string | null | undefined { return this.props.volume; }
  get condition(): Condition { return this.props.condition; }
  get status(): Status { return this.props.status; }
  get weight(): number { return this.props.weight; }
  get publisherId(): number { return this.props.publisherId; }
  get languageId(): number { return this.props.languageId; }
  get genreId(): number { return this.props.genreId; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  public activate(): void {
    this.props.isActive = true;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public update(data: Partial<Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>>) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (this.props as any)[key] = value;
      }
    });
  }

  updateWeight(weight: number) {
    if (weight <= 0) {
      throw new Error('Peso inválido');
    }
    this.props.weight = weight;
  }

  toJSON(): BookProps {
    return this.props;
  }

}