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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RequirePermission } from '../../../common';
import { PermissionsGuard } from '../../../common/guards';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  ListUsersUseCase,
  UpdateUserUseCase,
} from '../application/use-cases';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from '../application/dtos';
import type { UserFilters } from '../domain/repositories/user.repository.interface';

@ApiTags('Users')
@ApiBearerAuth()
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
  @ApiOperation({
    summary: 'Listar usuários',
    description:
      'Retorna uma lista paginada de usuários com filtros opcionais.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários recuperada com sucesso.',
  })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente.' })
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
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      filters,
    );

    return { success: true, data: result.data };
  }

  @Post()
  @RequirePermission('user:create')
  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Cria um novo usuário no sistema.',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async create(@Body() dto: CreateUserDto) {
    const result = await this.createUserUseCase.execute(dto);

    if (!result.success) {
      throw new ConflictException(result.error);
    }

    return { success: true, data: result.data };
  }

  @Patch(':id')
  @RequirePermission('user:update')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza dados de um usuário existente.',
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
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

    return { success: true, data: result.data };
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir usuário',
    description: 'Remove um usuário do sistema.',
  })
  @ApiResponse({ status: 204, description: 'Usuário excluído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.deleteUserUseCase.execute(id);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }
  }
}
