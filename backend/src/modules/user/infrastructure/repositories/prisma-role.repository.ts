import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database';
import {
  RoleEntity,
  PermissionEntity,
} from '../../domain/entities/role.entity';
import { IRoleRepository } from '../../domain/repositories/role.repository.interface';

@Injectable()
export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!role) return null;
    return this.mapToEntity(role);
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: { permissions: true },
    });

    if (!role) return null;
    return this.mapToEntity(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });

    return roles.map((role) => this.mapToEntity(role));
  }

  async findAllPermissions(): Promise<PermissionEntity[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });

    return permissions.map((p) => this.mapPermissionToEntity(p));
  }

  async create(data: {
    name: string;
    permissionIds: string[];
  }): Promise<RoleEntity> {
    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        permissions: {
          connect: data.permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });

    return this.mapToEntity(role);
  }

  async update(
    id: string,
    data: Partial<{ name: string; permissionIds: string[] }>,
  ): Promise<RoleEntity> {
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.permissionIds && {
          permissions: {
            set: data.permissionIds.map((id) => ({ id })),
          },
        }),
      },
      include: { permissions: true },
    });

    return this.mapToEntity(role);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }

  private mapToEntity(
    role: Prisma.RoleGetPayload<{ include: { permissions: true } }>,
  ): RoleEntity {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((p) => this.mapPermissionToEntity(p)),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  private mapPermissionToEntity(
    permission: Prisma.PermissionGetPayload<Record<string, never>>,
  ): PermissionEntity {
    return {
      id: permission.id,
      action: permission.action,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
