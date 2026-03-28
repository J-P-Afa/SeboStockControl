import { Inject, Injectable } from '@nestjs/common';
import type { LanguageRepository } from '../../domain/language.repository';

@Injectable()
export class GetLanguageByIdUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
  ) {}

  async execute(id: number) {
    const language = await this.languageRepo.findById(id);

    if (!language) {
      return { success: false, error: 'Idioma não encontrado' };
    }

    return { success: true, data: language };
  }
}
