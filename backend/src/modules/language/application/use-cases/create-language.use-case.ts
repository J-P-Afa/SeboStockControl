import { Inject, Injectable } from '@nestjs/common';
import type { LanguageRepository } from '../../domain/language.repository';
import { LanguageEntity } from '../../domain/language.entity';

interface CreateLanguageInput {
  description: string;
}

@Injectable()
export class CreateLanguageUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
  ) {}

  async execute(input: CreateLanguageInput) {
    try {
      const language = LanguageEntity.create({
        description: input.description,
        isActive: true,
      });

      const saved = await this.languageRepo.create(language);

      return { success: true, data: saved };
    } catch {
      return { success: false, error: 'Erro ao criar language' };
    }
  }
}
