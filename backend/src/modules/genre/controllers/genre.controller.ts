import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { CreateGenreUseCase } from '../application/use-cases/create-genre.use-case';
import { GetGenresUseCase } from '../application/use-cases/get-genres.use-case';
import { GetGenreByIdUseCase } from '../application/use-cases/get-genre-by-id.use-case';
import { UpdateGenreUseCase } from '../application/use-cases/update-genre.use-case';
import { DeleteGenreUseCase } from '../application/use-cases/delete-genre.use-case';

import { CreateGenreDto } from '../application/dtos/create-genre.dto';
import { UpdateGenreDto } from '../application/dtos/update-genre.dto';

@Controller('genres')
export class GenreController {
  constructor(
    private readonly createGenre: CreateGenreUseCase,
    private readonly getGenres: GetGenresUseCase,
    private readonly getGenreById: GetGenreByIdUseCase,
    private readonly updateGenre: UpdateGenreUseCase,
    private readonly deleteGenre: DeleteGenreUseCase,
  ) {}

  //CREATE
  @Post()
  async create(@Body() dto: CreateGenreDto) {
    const result = await this.createGenre.execute(dto);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      genre: result.data,
    };
  }

  //LIST
  @Get()
  async findAll() {
    const result = await this.getGenres.execute();

    return {
      success: true,
      genres: result.data,
    };
  }

  //GET BY ID
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getGenreById.execute(id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      genre: result.data,
    };
  }

  //UPDATE
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ) {
    const result = await this.updateGenre.execute({
      id,
      ...dto,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      genre: result.data,
    };
  }

  //DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteGenre.execute(id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
    };
  }
}