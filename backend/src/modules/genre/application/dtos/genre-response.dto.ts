export class GenreResponseDto {
  id: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: any): GenreResponseDto {
    return {
      id: entity.id,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
