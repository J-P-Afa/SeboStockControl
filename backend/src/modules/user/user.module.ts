import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/repositories/user.repository.interface';
import { ROLE_REPOSITORY } from './domain/repositories/role.repository.interface';
import { HASH_PROVIDER } from './application/providers/hash.provider.interface';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetMeUseCase,
  ListUsersUseCase,
  UpdateMyPreferencesUseCase,
  UpdateUserUseCase,
  CreateRoleUseCase,
  DeleteRoleUseCase,
  ListRolesUseCase,
  UpdateRoleUseCase,
} from './application/use-cases';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { BcryptHashProvider } from './infrastructure/providers/bcrypt-hash.provider';
import { MeController } from './presentation/me.controller';
import { RoleController } from './presentation/role.controller';
import { UserController } from './presentation/user.controller';

@Module({
  controllers: [UserController, RoleController, MeController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
    {
      provide: HASH_PROVIDER,
      useClass: BcryptHashProvider,
    },
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetMeUseCase,
    UpdateMyPreferencesUseCase,
    ListRolesUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
  ],
  exports: [USER_REPOSITORY, ROLE_REPOSITORY, HASH_PROVIDER],
})
export class UserModule {}
