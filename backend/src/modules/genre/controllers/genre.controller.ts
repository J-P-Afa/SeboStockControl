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
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreateGenreUseCase } from '../application/use-cases/create-genre.use-case';
import { GetGenresUseCase } from '../application/use-cases/get-genres.use-case';
import { GetGenreByIdUseCase } from '../application/use-cases/get-genre-by-id.use-case';
import { UpdateGenreUseCase } from '../application/use-cases/update-genre.use-case';
import { DeleteGenreUseCase } from '../application/use-cases/delete-genre.use-case';

import { CreateGenreDto } from '../application/dtos/create-genre.dto';
import { UpdateGenreDto } from '../application/dtos/update-genre.dto';
import { ListGenresQueryDto } from '../application/dtos/list-genres-query.dto';
import { PermissionsGuard, RequirePermission } from '../../../common';

@Controller('genres')
@UseGuards(PermissionsGuard)
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
  @RequirePermission('genre:write')
  async create(@Body() dto: CreateGenreDto) {
    return this.createGenre.execute(dto);
  }

  //LIST
  @Get()
  @RequirePermission('genre:read')
  async list(@Query() query: ListGenresQueryDto) {
    const filters = {
      search: query.search,
      isActive: query.isActive,
    };

    return this.getGenres.execute(
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      filters,
    );
  }

  //GET BY ID
  @Get(':id')
  @RequirePermission('genre:read')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getGenreById.execute(id);
  }

  //UPDATE
  @Put(':id')
  @RequirePermission('genre:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGenreDto,
  ) {
    return this.updateGenre.execute({
      id,
      ...dto,
    });
  }

  //DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('genre:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteGenre.execute(id);
  }
}
