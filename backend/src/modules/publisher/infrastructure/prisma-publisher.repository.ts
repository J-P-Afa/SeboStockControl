import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common';
import { PrismaService } from '../../database';
import { PublisherRepository } from '../domain/publisher.repository';
import { PublisherEntity } from '../domain/publisher.entity';

@Injectable()
export class PrismaPublisherRepository implements PublisherRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(data: {
    id: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PublisherEntity {
    return PublisherEntity.restore({
      id: data.id,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  private toPrisma(entity: PublisherEntity) {
    return {
      description: entity.description,
      isActive: entity.isActive,
    };
  }

  async create(publisher: PublisherEntity): Promise<PublisherEntity> {
    const created = await this.prisma.publisher.create({
      data: this.toPrisma(publisher),
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<PublisherEntity | null> {
    const found = await this.prisma.publisher.findUnique({
      where: { id },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findByDescription(
    description: string,
  ): Promise<PublisherEntity | null> {
    const found = await this.prisma.publisher.findUnique({
      where: { description },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  private buildWhereClause(filters?: { search?: string; isActive?: boolean }): Prisma.PublisherWhereInput {
    const where: Prisma.PublisherWhereInput = {};

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
  ): Promise<PaginatedResult<PublisherEntity>> {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const [items, total] = await Promise.all([
      this.prisma.publisher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.publisher.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(publisher: PublisherEntity): Promise<PublisherEntity> {
    const updated = await this.prisma.publisher.update({
      where: { id: publisher.id },
      data: this.toPrisma(publisher),
    });

    return this.toEntity(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.publisher.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
