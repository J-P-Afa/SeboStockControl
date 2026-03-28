import { Inject, Injectable } from '@nestjs/common';
import type { LanguageRepository } from '../../domain/language.repository';

@Injectable()
export class DeleteLanguageUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
  ) {}

  async execute(id: number) {
    const exists = await this.languageRepo.findById(id);

    if (!exists) {
      return { success: false, error: 'Idioma não encontrado' };
    }

    const deleted = await this.languageRepo.delete(id);

    if (!deleted) {
      return { success: false, error: 'Erro ao deletar idioma' };
    }

    return { success: true };
  }
}
