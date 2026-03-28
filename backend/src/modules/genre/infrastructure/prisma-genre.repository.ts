import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database';
import { GenreEntity } from '../domain/genre.entity';
import type { GenreRepository } from '../domain/genre.repository';

@Injectable()
export class PrismaGenreRepository implements GenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Mapper: Prisma → Entity
  private toEntity(data: any): GenreEntity {
    return GenreEntity.restore({
      id: data.id,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  // Mapper: Entity → Prisma
  private toPrisma(entity: GenreEntity) {
    return {
      description: entity.description,
      isActive: entity.isActive,
    };
  }

  private buildWhereClause(filters?: { search?: string; isActive?: boolean }): Prisma.GenreWhereInput {
    const where: Prisma.GenreWhereInput = {};

    if (filters?.search) {
      where.description = {
        contains: filters.search,
        mode: 'insensitive', // compatível com Prisma StringFilter
      };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  async create(genre: GenreEntity): Promise<GenreEntity> {
    const created = await this.prisma.genre.create({
      data: this.toPrisma(genre),
    });
    return this.toEntity(created);
  }

  async findById(id: number): Promise<GenreEntity | null> {
    const genre = await this.prisma.genre.findUnique({ where: { id } });
    if (!genre) return null;
    return this.toEntity(genre);
  }

  async findByDescription(description: string): Promise<GenreEntity | null> {
    const found = await this.prisma.genre.findUnique({
      where: { description },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: { search?: string; isActive?: boolean },
  ): Promise<{
    items: GenreEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [genres, total] = await Promise.all([
      this.prisma.genre.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.genre.count({ where }),
    ]);

    return list.map(this.toEntity);
  }

  async update(genre: GenreEntity): Promise<GenreEntity> {
    const updated = await this.prisma.genre.update({
      where: { id: genre.id },
      data: this.toPrisma(genre),
    });
    return this.toEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.genre.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
