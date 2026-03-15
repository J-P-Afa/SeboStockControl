import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../common';
import { PrismaService } from '../../../database';
import { UserEntity } from '../../domain/entities/user.entity';
import type { UserFilters } from '../../domain/repositories/user.repository.interface';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) return null;

    return { ...user, roleName: user.role.name };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) return null;

    return { ...user, roleName: user.role.name };
  }

  private buildWhereClause(filters?: UserFilters): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.roleIds?.length) {
      where.roleId = { in: filters.roleIds };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return where;
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc',
    filters?: UserFilters,
  ): Promise<PaginatedResult<UserEntity>> {
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(filters);

    const orderBy =
      sortBy === 'roleName'
        ? { role: { name: sortOrder } }
        : { [sortBy]: sortOrder };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((u) => ({ ...u, roleName: u.role.name })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(
    data: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'roleName' | 'themePreference'> & {
      themePreference?: UserEntity['themePreference'];
    },
  ): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        isActive: data.isActive,
        roleId: data.roleId,
        ...(data.themePreference != null && { themePreference: data.themePreference }),
      },
      include: { role: true },
    });

    return { ...user, roleName: user.role.name };
  }

  async update(
    id: string,
    data: Partial<
      Pick<UserEntity, 'name' | 'email' | 'password' | 'isActive' | 'roleId' | 'themePreference'>
    >,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });

    return { ...user, roleName: user.role.name };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
