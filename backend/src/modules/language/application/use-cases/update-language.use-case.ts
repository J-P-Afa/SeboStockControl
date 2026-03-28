import { Inject, Injectable } from '@nestjs/common';
import type { LanguageRepository } from '../../domain/language.repository';

interface UpdateLanguageInput {
  id: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class UpdateLanguageUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
  ) {}

  async execute(input: UpdateLanguageInput) {
    const language = await this.languageRepo.findById(input.id);

    if (!language) {
      return { success: false, error: 'Idioma não encontrado' };
    }

    try {
      if (input.description !== undefined) {
        language.updateDescription(input.description);
      }

      if (input.isActive !== undefined) {
        input.isActive ? language.activate() : language.deactivate();
      }

      const updated = await this.languageRepo.update(language);

      return { success: true, data: updated };
    } catch {
      return { success: false, error: 'Erro ao atualizar idioma' };
    }
  }
}
