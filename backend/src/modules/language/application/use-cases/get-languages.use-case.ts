import { Inject, Injectable } from '@nestjs/common';
import type { LanguageRepository } from '../../domain/language.repository';

@Injectable()
export class GetLanguagesUseCase {
  constructor(
    @Inject('LanguageRepository')
    private readonly languageRepo: LanguageRepository,
  ) {}

  async execute() {
    const languages = await this.languageRepo.findAll();

    return { success: true, data: languages };
  }
}
