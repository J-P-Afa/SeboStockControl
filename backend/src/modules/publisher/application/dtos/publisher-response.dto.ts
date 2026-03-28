import { PublisherEntity } from '../../domain/publisher.entity';

export class PublisherResponseDto {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;

  static fromEntity(entity: PublisherEntity): PublisherResponseDto {
    return {
      id: entity.id!,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt!.toISOString(),
    };
  }
}
