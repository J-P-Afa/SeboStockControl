import { Module } from '@nestjs/common';

import { GenreController } from './controllers/genre.controller';

import { PrismaService } from '../database';
import { PrismaGenreRepository } from './infrastructure/prisma-genre.repository';

import { CreateGenreUseCase } from './application/use-cases/create-genre.use-case';
import { GetGenresUseCase } from './application/use-cases/get-genres.use-case';
import { GetGenreByIdUseCase } from './application/use-cases/get-genre-by-id.use-case';
import { UpdateGenreUseCase } from './application/use-cases/update-genre.use-case';
import { DeleteGenreUseCase } from './application/use-cases/delete-genre.use-case';

@Module({
  controllers: [GenreController],
  providers: [
    PrismaService,

    // Repository (injeção)
    {
      provide: 'GenreRepository',
      useClass: PrismaGenreRepository,
    },

    // UseCases
    CreateGenreUseCase,
    GetGenresUseCase,
    GetGenreByIdUseCase,
    UpdateGenreUseCase,
    DeleteGenreUseCase,
  ],
})
export class GenreModule {}