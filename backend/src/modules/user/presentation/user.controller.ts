import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  ConflictException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RequirePermission } from '../../../common';
import { PermissionsGuard } from '../../../common/guards';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase,
} from '../application/use-cases';
import { CreateUserDto, ListUsersQueryDto, UpdateUserDto } from '../application/dtos';
import type { UserFilters } from '../domain/repositories/user.repository.interface';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @RequirePermission('user:read')
  async list(@Query() query: ListUsersQueryDto) {
    const filters: UserFilters = {};

    if (query.search) {
      filters.search = query.search;
    }

    if (query.roleIds) {
      filters.roleIds = query.roleIds.split(',').filter(Boolean);
    }

    if (query.isActive !== undefined) {
      filters.isActive = query.isActive;
    }

    const result = await this.listUsersUseCase.execute(
      query.page!,
      query.limit!,
      query.sortBy!,
      query.sortOrder!,
      filters,
    );

    return result.data;
  }

  @Post()
  @RequirePermission('user:create')
  async create(@Body() dto: CreateUserDto) {
    const result = await this.createUserUseCase.execute(dto);

    if (!result.success) {
      throw new ConflictException(result.error);
    }

    return result.data;
  }

  @Patch(':id')
  @RequirePermission('user:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const result = await this.updateUserUseCase.execute(id, dto);

    if (!result.success) {
      if (result.error?.code === 'USER_NOT_FOUND') {
        throw new NotFoundException(result.error);
      }
      throw new ConflictException(result.error);
    }

    return result.data;
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.deleteUserUseCase.execute(id);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }
  }
}
