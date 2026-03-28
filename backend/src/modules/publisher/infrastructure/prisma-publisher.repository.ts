import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database';
import { PublisherRepository } from '../domain/publisher.repository';
import { PublisherEntity } from '../domain/publisher.entity';

@Injectable()
export class PrismaPublisherRepository implements PublisherRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(data: any): PublisherEntity {
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

  async findByDescription(description: string): Promise<PublisherEntity | null> {
    const found = await this.prisma.publisher.findUnique({
      where: { description },
    });

    if (!found) return null;

    return this.toEntity(found);
  }

  async findAll(): Promise<PublisherEntity[]> {
    const list = await this.prisma.publisher.findMany();

    return list.map(this.toEntity);
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
