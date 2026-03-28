import { EditionType, Condition, Status } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * @ai-context Entidade de domínio Book — puro, sem dependências de framework.
 * Encapsula todos os campos do schema e as invariantes de negócio.
 */

export interface BookProps {
  id: number;
  title: string;
  subtitle?: string | null;
  author?: string | null;
  isbn13?: string | null;
  isbn10?: string | null;
  listPrice?: Prisma.Decimal | null;
  editionType: EditionType;
  volume?: string | null;
  collection?: string | null;
  condition: Condition;
  status: Status;
  publicationYear?: number | null;
  pages?: number | null;
  synopsis?: string | null;
  dimensions?: string | null;
  weight: Prisma.Decimal;
  publisherId: number;
  languageId: number;
  genreId: number;
  classificacaoId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /**
   * @ai-context Campo de read-model — populado via join pelo repositório de infraestrutura.
   * Não participa de invariantes de domínio. Usar apenas para exibição/DTO.
   */
  estoqueQuantidade?: number | null;
}

export class BookEntity {
  private props: BookProps;

  private constructor(props: BookProps) {
    this.props = props;
  }

  public static create(
    props: Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): BookEntity {
    BookEntity.validateIsbn(props.isbn13, props.isbn10);
    return new BookEntity({
      ...props,
      id: 0,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static restore(props: BookProps): BookEntity {
    return new BookEntity(props);
  }

  /** @ai-context RULE [LIV-02]: ISBN deve ter exatamente 13 ou 10 dígitos numéricos. */
  private static validateIsbn(
    isbn13?: string | null,
    isbn10?: string | null,
  ): void {
    if (isbn13 !== null && isbn13 !== undefined && !/^\d{13}$/.test(isbn13)) {
      throw new Error('ISBN-13 deve conter exatamente 13 dígitos numéricos');
    }
    if (isbn10 !== null && isbn10 !== undefined && !/^\d{10}$/.test(isbn10)) {
      throw new Error('ISBN-10 deve conter exatamente 10 dígitos numéricos');
    }
  }

  get id(): number {
    return this.props.id;
  }
  get title(): string {
    return this.props.title;
  }
  get subtitle(): string | null | undefined {
    return this.props.subtitle;
  }
  get author(): string | null | undefined {
    return this.props.author;
  }
  get isbn13(): string | null | undefined {
    return this.props.isbn13;
  }
  get isbn10(): string | null | undefined {
    return this.props.isbn10;
  }
  get listPrice(): Prisma.Decimal | null | undefined {
    return this.props.listPrice;
  }
  get editionType(): EditionType {
    return this.props.editionType;
  }
  get volume(): string | null | undefined {
    return this.props.volume;
  }
  get collection(): string | null | undefined {
    return this.props.collection;
  }
  get condition(): Condition {
    return this.props.condition;
  }
  get status(): Status {
    return this.props.status;
  }
  get publicationYear(): number | null | undefined {
    return this.props.publicationYear;
  }
  get pages(): number | null | undefined {
    return this.props.pages;
  }
  get synopsis(): string | null | undefined {
    return this.props.synopsis;
  }
  get dimensions(): string | null | undefined {
    return this.props.dimensions;
  }
  get weight(): Prisma.Decimal {
    return this.props.weight;
  }
  get publisherId(): number {
    return this.props.publisherId;
  }
  get languageId(): number {
    return this.props.languageId;
  }
  get genreId(): number {
    return this.props.genreId;
  }
  get classificacaoId(): number | null | undefined {
    return this.props.classificacaoId;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get estoqueQuantidade(): number | null | undefined {
    return this.props.estoqueQuantidade;
  }

  public update(
    props: Partial<Omit<BookProps, 'id' | 'createdAt' | 'updatedAt'>>,
  ): void {
    if (props.isbn13 !== undefined || props.isbn10 !== undefined) {
      BookEntity.validateIsbn(
        props.isbn13 !== undefined ? props.isbn13 : this.props.isbn13,
        props.isbn10 !== undefined ? props.isbn10 : this.props.isbn10,
      );
    }
    this.props = {
      ...this.props,
      ...props,
      updatedAt: new Date(),
    };
  }

  public toJSON(): BookProps {
    return { ...this.props };
  }

  public desativar(): void {
    this.props.isActive = false;
  }
  public ativar(): void {
    this.props.isActive = true;
  }
}
