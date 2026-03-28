import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { BookRepository } from '../domain/book.repository';
import { BookEntity } from '../domain/book.entity';
import { Book, Condition } from '@prisma/client';

@Injectable()
export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaService) {}

    //MAPPERS

  private toEntity(prisma: Book): BookEntity {
    return BookEntity.restore({
      id: prisma.id,
      title: prisma.title,
      isbn13: prisma.isbn13,
      isbn10: prisma.isbn10,
      editionType: prisma.editionType,
      volume: prisma.volume,
      condition: prisma.condition,
      status: prisma.status,
      weight: Number(prisma.weight),
      publisherId: prisma.publisherId,
      languageId: prisma.languageId,
      genreId: prisma.genreId,
      isActive: prisma.isActive,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  private toPrisma(entity: BookEntity) {
    const data = entity.toJSON();

    return {
      title: data.title,
      isbn13: data.isbn13 ?? null,
      isbn10: data.isbn10 ?? null,
      editionType: data.editionType,
      volume: data.volume ?? null,
      condition: data.condition,
      status: data.status,
      weight: data.weight,
      publisherId: data.publisherId,
      languageId: data.languageId,
      genreId: data.genreId,
      isActive: data.isActive,
    };
  }

  //CREATE
  async create(book: BookEntity): Promise<BookEntity> {
    const created = await this.prisma.book.create({
      data: this.toPrisma(book),
    });

    return this.toEntity(created);
  }

  async findByIsbn13AndCondition(
    isbn13: string,
    condition: Condition,
  ): Promise<BookEntity | null> {
    const book = await this.prisma.book.findFirst({
      where: {
        isbn13,
        condition,
      },
    });

    if (!book) return null;
    return this.toEntity(book);
  }

  async findByIsbn10AndCondition(
    isbn10: string,
    condition: Condition,
  ): Promise<BookEntity | null> {
    const book = await this.prisma.book.findFirst({
      where: {
        isbn10,
        condition,
      },
    });

    if (!book) return null;
    return this.toEntity(book);
  }

  //FIND ALL
async findAll(filters?: any): Promise<BookEntity[]> {
  const books = await this.prisma.book.findMany({
    where: {
      ...(filters?.title && {
        title: { contains: filters.title, mode: 'insensitive' },
      }),
      ...(filters?.genreId && { genreId: filters.genreId }),
      ...(filters?.publisherId && { publisherId: filters.publisherId }),
      ...(filters?.languageId && { languageId: filters.languageId }),
      ...(filters?.condition && { condition: filters.condition }),
      ...(filters?.status && { status: filters.status }),
    },
  });

  return books.map((book) => this.toEntity(book));
}

  //FIND BY ID
  async findById(id: number): Promise<BookEntity | null> {
    const book = await this.prisma.book.findUnique({
      where: { id },
    });

    if (!book) return null;

    return this.toEntity(book);
  }

  //UPDATE
  async update(book: BookEntity): Promise<BookEntity> {
    const data = book.toJSON();

    const updated = await this.prisma.book.update({
      where: { id: data.id! },
      data: this.toPrisma(book),
    });

    return this.toEntity(updated);
  }

  //DELETE
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.book.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

}