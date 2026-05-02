import { EditionType, Condition, Status } from '@prisma/client';
import { Prisma } from '@prisma/client';

/**
 * @ai-context Entidade de domínio Book — puro, sem dependências de framework.
 * Encapsula todos os campos do schema e as invariantes de negócio.
 */

type SimpleRelation = {
  id: number;
  description: string;
};

export interface BookProps {
  id: number;
  title: string;
  subtitle?: string | null;
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
  coverUrl?: string | null;
  weight: Prisma.Decimal;
  publisherId?: number | null;
  languageId?: number | null;
  genreId?: number | null;
  classificacaoId?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /**
   * @ai-context Campo de read-model — populado via join pelo repositório de infraestrutura.
   * Não participa de invariantes de domínio. Usar apenas para exibição/DTO.
   */
  stock?: number | null;
  stockUnitCost?: Prisma.Decimal | null;
  stockTotalCost?: Prisma.Decimal | null;
  publisher?: SimpleRelation | null;
  language?: SimpleRelation | null;
  genre?: SimpleRelation | null;
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

    const cleanIsbn13 = props.isbn13
      ? props.isbn13.replace(/[^0-9]/g, '')
      : props.isbn13;
    const cleanIsbn10 = props.isbn10
      ? props.isbn10.replace(/[^0-9X]/gi, '').toUpperCase()
      : props.isbn10;

    return new BookEntity({
      ...props,
      isbn13: cleanIsbn13,
      isbn10: cleanIsbn10,
      id: 0,
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static restore(props: BookProps): BookEntity {
    return new BookEntity(props);
  }

  /** @ai-context RULE [LIV-02]: ISBN deve ter exatamente 13 ou 10 dígitos numéricos (ISBN-10 pode terminar em X). */
  private static validateIsbn(
    isbn13?: string | null,
    isbn10?: string | null,
  ): void {
    if (isbn13) {
      const clean13 = isbn13.replace(/[^0-9]/g, '');
      if (clean13.length !== 13) {
        throw new Error('ISBN-13 deve conter exatamente 13 dígitos numéricos');
      }
    }
    if (isbn10) {
      const clean10 = isbn10.replace(/[^0-9X]/gi, '');
      if (!/^\d{9}[0-9X]$/i.test(clean10)) {
        throw new Error(
          'ISBN-10 deve conter exatamente 10 caracteres (9 dígitos + dígito verificador 0-9 ou X)',
        );
      }
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
  get coverUrl(): string | null | undefined {
    return this.props.coverUrl;
  }
  get weight(): Prisma.Decimal {
    return this.props.weight;
  }
  get publisherId(): number | null | undefined {
    return this.props.publisherId;
  }
  get languageId(): number | null | undefined {
    return this.props.languageId;
  }
  get genreId(): number | null | undefined {
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
  get stock(): number | null | undefined {
    return this.props.stock;
  }
  get stockUnitCost(): Prisma.Decimal | null | undefined {
    return this.props.stockUnitCost;
  }
  get stockTotalCost(): Prisma.Decimal | null | undefined {
    if (
      this.props.stockTotalCost == null &&
      this.props.stockUnitCost !== undefined &&
      this.props.stockUnitCost !== null &&
      this.props.stock !== undefined &&
      this.props.stock !== null
    ) {
      return this.props.stockUnitCost.mul(this.props.stock);
    }
    return this.props.stockTotalCost;
  }

  get publisher(): SimpleRelation | null | undefined {
  return this.props.publisher;
  }

  get language(): SimpleRelation | null | undefined {
    return this.props.language;
  }

  get genre(): SimpleRelation | null | undefined {
    return this.props.genre;
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

    const cleanIsbn13 =
      props.isbn13 !== undefined
        ? props.isbn13
          ? props.isbn13.replace(/[^0-9]/g, '')
          : props.isbn13
        : undefined;
    const cleanIsbn10 =
      props.isbn10 !== undefined
        ? props.isbn10
          ? props.isbn10.replace(/[^0-9X]/gi, '').toUpperCase()
          : props.isbn10
        : undefined;

    this.props = {
      ...this.props,
      ...props,
      ...(cleanIsbn13 !== undefined && { isbn13: cleanIsbn13 }),
      ...(cleanIsbn10 !== undefined && { isbn10: cleanIsbn10 }),
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
