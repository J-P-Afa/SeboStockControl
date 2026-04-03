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

import { CreateLanguageUseCase } from '../application/use-cases/create-language.use-case';
import { GetLanguagesUseCase } from '../application/use-cases/get-languages.use-case';
import { GetLanguageByIdUseCase } from '../application/use-cases/get-language-by-id.use-case';
import { UpdateLanguageUseCase } from '../application/use-cases/update-language.use-case';
import { DeleteLanguageUseCase } from '../application/use-cases/delete-language.use-case';

import { CreateLanguageDto } from '../application/dtos/create-language.dto';
import { UpdateLanguageDto } from '../application/dtos/update-language.dto';
import { ListLanguagesQueryDto } from '../application/dtos/list-languages-query.dto';
import { PermissionsGuard, RequirePermission } from '../../../common';

@Controller('languages')
@UseGuards(PermissionsGuard)
export class LanguageController {
  constructor(
    private readonly createLanguage: CreateLanguageUseCase,
    private readonly getLanguages: GetLanguagesUseCase,
    private readonly getLanguageById: GetLanguageByIdUseCase,
    private readonly updateLanguage: UpdateLanguageUseCase,
    private readonly deleteLanguage: DeleteLanguageUseCase,
  ) {}

  @Post()
  @RequirePermission('language:write')
  async create(@Body() dto: CreateLanguageDto) {
    return this.createLanguage.execute(dto);
  }

  @Get()
  @RequirePermission('language:read')
  async list(@Query() query: ListLanguagesQueryDto) {
    const filters = {
      search: query.search,
      isActive: query.isActive,
    };

    return this.getLanguages.execute(
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      filters,
    );
  }

  @Get(':id')
  @RequirePermission('language:read')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getLanguageById.execute(id);
  }

  @Put(':id')
  @RequirePermission('language:write')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLanguageDto,
  ) {
    return this.updateLanguage.execute({
      id,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('language:write')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteLanguage.execute(id);
  }
}
