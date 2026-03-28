import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { LanguageRepository } from '../domain/language.repository';
import { LanguageEntity } from '../domain/language.entity';

@Injectable()
export class PrismaLanguageRepository implements LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(data: any): LanguageEntity {
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

  async findAll(): Promise<LanguageEntity[]> {
    const list = await this.prisma.language.findMany();

    return list.map(this.toEntity);
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
