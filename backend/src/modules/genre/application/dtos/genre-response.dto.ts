import { GenreEntity } from '../../domain/genre.entity';

export class GenreResponseDto {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: GenreEntity): GenreResponseDto {
    if (
      entity.id === undefined ||
      entity.createdAt === undefined ||
      entity.updatedAt === undefined
    ) {
      throw new Error('Gênero incompleto vindo da base de dados.');
    }
    return {
      id: entity.id,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
