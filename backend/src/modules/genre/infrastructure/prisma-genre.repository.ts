import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { GenreRepository } from '../domain/genre.repository';
import { GenreEntity } from '../domain/genre.entity';

@Injectable()
export class PrismaGenreRepository implements GenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  //Mapper: Prisma → Entity
  private toEntity(data: {
    id: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): GenreEntity {
    return GenreEntity.restore({
      id: data.id,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  //Mapper: Entity → Prisma
  private toPrisma(entity: GenreEntity) {
    return {
      description: entity.description,
      isActive: entity.isActive,
    };
  }

  async create(genre: GenreEntity): Promise<GenreEntity> {
    const created = await this.prisma.genre.create({
      data: this.toPrisma(genre),
    });

    return this.toEntity(created);
  }

  async findById(id: number): Promise<GenreEntity | null> {
    const found = await this.prisma.genre.findUnique({
      where: { id },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findByDescription(description: string): Promise<GenreEntity | null> {
    const found = await this.prisma.genre.findUnique({
      where: { description },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findAll(): Promise<GenreEntity[]> {
    const list = await this.prisma.genre.findMany();

    return list.map((item) => this.toEntity(item));
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
      await this.prisma.genre.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
