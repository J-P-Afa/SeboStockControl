import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Result } from '../../../../common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto, UserResponseDto } from '../dtos';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(
    id: string,
    dto: UpdateUserDto,
  ): Promise<Result<UserResponseDto>> {
    const existingUser = await this.userRepository.findById(id);

    if (!existingUser) {
      return Result.fail('USER_NOT_FOUND', 'User not found');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const emailTaken = await this.userRepository.findByEmail(dto.email);
      if (emailTaken) {
        return Result.fail('USER_EMAIL_EXISTS', 'A user with this email already exists');
      }
    }

    const updateData: Partial<{ name: string; email: string; password: string; isActive: boolean; roleId: string }> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.roleId !== undefined) updateData.roleId = dto.roleId;
    if (dto.password !== undefined) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateData);

    return Result.ok(UserResponseDto.fromEntity(updatedUser));
  }
}
