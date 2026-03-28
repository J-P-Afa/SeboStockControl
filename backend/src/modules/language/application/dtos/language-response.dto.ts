import { LanguageEntity } from '../../domain/language.entity';

export class LanguageResponseDto {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: string;

  static fromEntity(entity: LanguageEntity): LanguageResponseDto {
    return {
      id: entity.id!,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt!.toISOString(),
    };
  }
}
