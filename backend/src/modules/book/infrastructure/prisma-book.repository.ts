import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { IBookRepository, CreateBookParams, UpdateBookParams, BookFilters } from '../domain/book.repository.interface';
import { BookEntity, BookProps } from '../domain/book.entity';
import { Book, Condition } from '@prisma/client';

/** Tipo interno: resultado do Prisma com o join 1:1 de Estoque */
type BookWithEstoque = Book & { estoque?: { quantidade: number } | null };

/**
 * @ai-context Implementação do repositório usando Prisma.
 * A criação do Estoque (RULE [LIV-01]) é feita via transação atômica neste repositório.
 */
@Injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(prisma: BookWithEstoque): BookEntity {
    const props: BookProps = {
      id: prisma.id,
      title: prisma.title,
      subtitle: prisma.subtitle,
      author: prisma.author,
      isbn13: prisma.isbn13,
      isbn10: prisma.isbn10,
      listPrice: prisma.listPrice,
      editionType: prisma.editionType,
      volume: prisma.volume,
      collection: prisma.collection,
      condition: prisma.condition,
      status: prisma.status,
      publicationYear: prisma.publicationYear,
      pages: prisma.pages,
      synopsis: prisma.synopsis,
      dimensions: prisma.dimensions,
      weight: prisma.weight,
      publisherId: prisma.publisherId,
      languageId: prisma.languageId,
      genreId: prisma.genreId,
      classificacaoId: prisma.classificacaoId,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
      // @ai-context: campo de infra enriquecido via join; não pertence ao domínio puro
      estoqueQuantidade: prisma.estoque?.quantidade ?? null,
    };
    return BookEntity.restore(props);
  }

  async findById(id: number): Promise<BookEntity | null> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { estoque: { select: { quantidade: true } } },
    });
    return book ? this.toEntity(book) : null;
  }

  /**
   * Busca livro por ISBN-13 ou ISBN-10 sem filtro de condição.
   * @ai-context Usado pelo leitor de código de barras na tela de Entrada.
   */
  async findByIsbn(isbn: string): Promise<BookEntity | null> {
    const book = await this.prisma.book.findFirst({
      where: { OR: [{ isbn13: isbn }, { isbn10: isbn }] },
      include: { estoque: { select: { quantidade: true } } },
    });
    return book ? this.toEntity(book) : null;
  }

  async findAll(filters?: BookFilters): Promise<BookEntity[]> {
    const books = await this.prisma.book.findMany({
      where: {
        ...(filters?.id && { id: filters.id }),
        ...(filters?.isbn && {
          OR: [
            { isbn13: { contains: filters.isbn } },
            { isbn10: { contains: filters.isbn } },
          ],
        }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { author: { contains: filters.search, mode: 'insensitive' } },
            { isbn13: { contains: filters.search } },
            { isbn10: { contains: filters.search } },
          ],
        }),
        ...(filters?.classificacaoId && { classificacaoId: filters.classificacaoId }),
        ...(filters?.publisherId && { publisherId: filters.publisherId }),
        ...(filters?.languageId && { languageId: filters.languageId }),
        ...(filters?.genreId && { genreId: filters.genreId }),
        ...(filters?.editionType && { editionType: filters.editionType }),
        ...(filters?.volume && { volume: { contains: filters.volume, mode: 'insensitive' } }),
        ...(filters?.collection && { collection: { contains: filters.collection, mode: 'insensitive' } }),
        ...(filters?.condition && { condition: filters.condition }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: { estoque: { select: { quantidade: true } } },
      orderBy: { title: 'asc' },
    });

    return books.map((book) => this.toEntity(book));
  }

  async findByIsbn13AndCondition(isbn13: string, condition: Condition): Promise<BookEntity | null> {
    const book = await this.prisma.book.findFirst({
      where: { isbn13, condition },
    });
    return book ? this.toEntity(book) : null;
  }

  async findByIsbn10AndCondition(isbn10: string, condition: Condition): Promise<BookEntity | null> {
    const book = await this.prisma.book.findFirst({
      where: { isbn10, condition },
    });
    return book ? this.toEntity(book) : null;
  }

  /**
   * Cria o Book e o Estoque inicial em transação atômica.
   * @ai-context Implementa RULE [LIV-01]: criar estoque zerado junto com o book.
   */
  async create(data: CreateBookParams): Promise<BookEntity> {
    const raw = await this.prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          title: data.title,
          subtitle: data.subtitle,
          author: data.author,
          isbn13: data.isbn13,
          isbn10: data.isbn10,
          listPrice: data.listPrice,
          editionType: data.editionType,
          volume: data.volume,
          collection: data.collection,
          condition: data.condition,
          status: data.status,
          publicationYear: data.publicationYear,
          pages: data.pages,
          synopsis: data.synopsis,
          dimensions: data.dimensions,
          weight: data.weight,
          publisherId: data.publisherId,
          languageId: data.languageId,
          genreId: data.genreId,
          classificacaoId: data.classificacaoId,
          isActive: data.isActive ?? true,
        },
      });

      // RULE [LIV-01]: criar estoque zerado automaticamente
      await tx.estoque.create({
        data: {
          bookId: book.id,
          quantidade: 0,
          custoMedio: 0,
        },
      });

      return tx.book.findUnique({
        where: { id: book.id },
        include: { estoque: { select: { quantidade: true } } },
      });
    });

    return this.toEntity(raw as BookWithEstoque);
  }

  async update(id: number, data: UpdateBookParams): Promise<BookEntity> {
    const updated = await this.prisma.book.update({
      where: { id },
      data: {
        ...data,
      },
      include: { estoque: { select: { quantidade: true } } },
    });
    return this.toEntity(updated);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.book.delete({
      where: { id },
    });
  }
}