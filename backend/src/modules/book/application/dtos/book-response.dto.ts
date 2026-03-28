import { BookEntity } from '../../domain/book.entity';
import { EditionType, Condition, Status } from '@prisma/client';
import { Prisma } from '@prisma/client';

export class BookResponseDto {
  id: number;
  title: string;
  subtitle: string | null | undefined;
  author: string | null | undefined;
  isbn13: string | null | undefined;
  isbn10: string | null | undefined;
  listPrice: Prisma.Decimal | null | undefined;
  editionType: EditionType;
  volume: string | null | undefined;
  collection: string | null | undefined;
  condition: Condition;
  status: Status;
  publicationYear: number | null | undefined;
  pages: number | null | undefined;
  synopsis: string | null | undefined;
  dimensions: string | null | undefined;
  weight: Prisma.Decimal;
  publisherId: number;
  languageId: number;
  genreId: number;
  classificacaoId: number | null | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** @ai-context Quantidade atual em estoque — join 1:1 via Estoque. Null se o estoque ainda não foi criado. */
  estoqueQuantidade: number | null | undefined;

  static fromEntity(entity: BookEntity): BookResponseDto {
    const dto = new BookResponseDto();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.subtitle = entity.subtitle;
    dto.author = entity.author;
    dto.isbn13 = entity.isbn13;
    dto.isbn10 = entity.isbn10;
    dto.listPrice = entity.listPrice;
    dto.editionType = entity.editionType;
    dto.volume = entity.volume;
    dto.collection = entity.collection;
    dto.condition = entity.condition;
    dto.status = entity.status;
    dto.publicationYear = entity.publicationYear;
    dto.pages = entity.pages;
    dto.synopsis = entity.synopsis;
    dto.dimensions = entity.dimensions;
    dto.weight = entity.weight;
    dto.publisherId = entity.publisherId;
    dto.languageId = entity.languageId;
    dto.genreId = entity.genreId;
    dto.classificacaoId = entity.classificacaoId;
    dto.isActive = entity.isActive;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.estoqueQuantidade = entity.estoqueQuantidade;
    return dto;
  }
}
