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
    return this.createPublisher.execute(dto);
  }

  @Get()
  async list(@Query() query: ListPublishersQueryDto) {
    const filters = {
      search: query.search,
      isActive: query.isActive,
    };

    return this.getPublishers.execute(
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      filters,
    );
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getPublisherById.execute(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePublisherDto,
  ) {
    return this.updatePublisher.execute({
      id,
      ...dto,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.deletePublisher.execute(id);
  }
}
