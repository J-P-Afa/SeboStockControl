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
} from '@nestjs/common';

import { CreatePublisherUseCase } from '../application/use-cases/create-publisher.use-case';
import { GetPublishersUseCase } from '../application/use-cases/get-publishers.use-case';
import { GetPublisherByIdUseCase } from '../application/use-cases/get-publisher-by-id.use-case';
import { UpdatePublisherUseCase } from '../application/use-cases/update-publisher.use-case';
import { DeletePublisherUseCase } from '../application/use-cases/delete-publisher.use-case';

import { CreatePublisherDto } from '../application/dtos/create-publisher.dto';
import { UpdatePublisherDto } from '../application/dtos/update-publisher.dto';
import { ListPublishersQueryDto } from '../application/dtos/list-publishers-query.dto';

@Controller('publishers')
export class PublisherController {
  constructor(
    private readonly createPublisher: CreatePublisherUseCase,
    private readonly getPublishers: GetPublishersUseCase,
    private readonly getPublisherById: GetPublisherByIdUseCase,
    private readonly updatePublisher: UpdatePublisherUseCase,
    private readonly deletePublisher: DeletePublisherUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreatePublisherDto) {
    const result = await this.createPublisher.execute(dto);

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
  async list(@Query() query: ListPublishersQueryDto) {
    const filters = {
      search: query.search,
      isActive: query.isActive,
    };

    const result = await this.getPublishers.execute(
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      filters,
    );

    return {
      success: true,
      data: result.data,
    };
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getPublisherById.execute(id);

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
    @Body() dto: UpdatePublisherDto,
  ) {
    const result = await this.updatePublisher.execute({
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
    const result = await this.deletePublisher.execute(id);

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
