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
    return this.listRolesUseCase.execute();
  }

  @Get('permissions')
  @RequirePermission('user:read')
  async listPermissions() {
    return this.listRolesUseCase.listPermissions();
  }

  @Post()
  @RequirePermission('user:create')
  async create(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }

  @Patch(':id')
  @RequirePermission('user:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.updateRoleUseCase.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteRoleUseCase.execute(id);
  }
}
