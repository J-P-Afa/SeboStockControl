import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common';
import { PrismaService } from '../../database';
import { LanguageRepository } from '../domain/language.repository';
import { LanguageEntity } from '../domain/language.entity';
@Injectable()
export class PrismaLanguageRepository implements LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(data: {
    id: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): LanguageEntity {
    return LanguageEntity.restore({
      id: data.id,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toPrisma(entity: LanguageEntity) {
    return {
      description: entity.description,
      isActive: entity.isActive,
    };
  }

  async create(language: LanguageEntity): Promise<LanguageEntity> {
    const created = await this.prisma.language.create({
      data: this.toPrisma(language),
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<LanguageEntity | null> {
    const found = await this.prisma.language.findUnique({
      where: { id },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findByDescription(description: string): Promise<LanguageEntity | null> {
    const found = await this.prisma.language.findUnique({
      where: { description },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  private buildWhereClause(filters?: { search?: string; isActive?: boolean }): Prisma.LanguageWhereInput {
    const where: Prisma.LanguageWhereInput = {};

    if (filters?.search) {
      where.description = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filters?: { search?: string; isActive?: boolean },
  ): Promise<PaginatedResult<LanguageEntity>> {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.language.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.language.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async update(language: LanguageEntity): Promise<LanguageEntity> {
    const updated = await this.prisma.language.update({
      where: { id: language.id },
      data: this.toPrisma(language),
    });

    return this.toEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.language.delete({
        where: { id },
      });

      return true;
    } catch {
      return false;
    }
  }
}
