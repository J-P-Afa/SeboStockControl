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

import { CreateLanguageUseCase } from '../application/use-cases/create-language.use-case';
import { GetLanguagesUseCase } from '../application/use-cases/get-languages.use-case';
import { GetLanguageByIdUseCase } from '../application/use-cases/get-language-by-id.use-case';
import { UpdateLanguageUseCase } from '../application/use-cases/update-language.use-case';
import { DeleteLanguageUseCase } from '../application/use-cases/delete-language.use-case';

import { CreateLanguageDto } from '../application/dtos/create-language.dto';
import { UpdateLanguageDto } from '../application/dtos/update-language.dto';

@Controller('languages')
export class LanguageController {
  constructor(
    private readonly createLanguage: CreateLanguageUseCase,
    private readonly getLanguages: GetLanguagesUseCase,
    private readonly getLanguageById: GetLanguageByIdUseCase,
    private readonly updateLanguage: UpdateLanguageUseCase,
    private readonly deleteLanguage: DeleteLanguageUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateLanguageDto) {
    const result = await this.createLanguage.execute(dto);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  @Get()
  async findAll() {
    const result = await this.getLanguages.execute();

    return {
      success: true,
      data: result.data,
    };
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getLanguageById.execute(id);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLanguageDto,
  ) {
    const result = await this.updateLanguage.execute({
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
      data: result.data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteLanguage.execute(id);

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
