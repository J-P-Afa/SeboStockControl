import { Module } from '@nestjs/common';

import { LanguageController } from './controllers/language.controller';

import { PrismaService } from '../database';
import { PrismaLanguageRepository } from './infrastructure/prisma-language.repository';

import { CreateLanguageUseCase } from './application/use-cases/create-language.use-case';
import { GetLanguagesUseCase } from './application/use-cases/get-languages.use-case';
import { GetLanguageByIdUseCase } from './application/use-cases/get-language-by-id.use-case';
import { UpdateLanguageUseCase } from './application/use-cases/update-language.use-case';
import { DeleteLanguageUseCase } from './application/use-cases/delete-language.use-case';

@Module({
  controllers: [LanguageController],
  providers: [
    PrismaService,

    {
      provide: 'LanguageRepository',
      useClass: PrismaLanguageRepository,
    },

    CreateLanguageUseCase,
    GetLanguagesUseCase,
    GetLanguageByIdUseCase,
    UpdateLanguageUseCase,
    DeleteLanguageUseCase,
  ],
})
export class LanguageModule {}
