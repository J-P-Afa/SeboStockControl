import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PermissionsGuard } from '../../../common/guards';
import { RequirePermission } from '../../../common';
import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  ListRolesUseCase,
  UpdateRoleUseCase,
} from '../application/use-cases';
import { CreateRoleDto, UpdateRoleDto } from '../application/dtos';

@Controller('roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Get()
  @RequirePermission('user:read')
  async list() {
    const result = await this.listRolesUseCase.execute();
    return { success: true, data: result.data };
  }

  @Get('permissions')
  @RequirePermission('user:read')
  async listPermissions() {
    const result = await this.listRolesUseCase.listPermissions();
    return { success: true, data: result.data };
  }

  @Post()
  @RequirePermission('user:create')
  async create(@Body() dto: CreateRoleDto) {
    const result = await this.createRoleUseCase.execute(dto);

    if (!result.success) {
      throw new ConflictException(result.error);
    }

    return { success: true, data: result.data };
  }

  @Patch(':id')
  @RequirePermission('user:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    const result = await this.updateRoleUseCase.execute(id, dto);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return { success: true, data: result.data };
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.deleteRoleUseCase.execute(id);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }
  }
}
