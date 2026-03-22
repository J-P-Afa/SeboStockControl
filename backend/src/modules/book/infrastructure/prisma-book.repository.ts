import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { Book } from '../domain/book.entity';
import { BookRepository } from '../domain/book.repository';

@Injectable()
export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Aqui removemos id, createdAt e updatedAt
  async create(data: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<Book> {
    return this.prisma.book.create({ data });
  }

  async findById(id: number): Promise<Book | null> {
    return this.prisma.book.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Book> {
    return this.prisma.book.update({ where: { id }, data });
  }
}