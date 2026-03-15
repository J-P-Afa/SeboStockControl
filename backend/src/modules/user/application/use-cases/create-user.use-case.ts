import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Result } from '../../../../common';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto, UserResponseDto } from '../dtos';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async execute(dto: CreateUserDto): Promise<Result<UserResponseDto>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      return Result.fail('USER_EMAIL_EXISTS', 'A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      roleId: dto.roleId,
      isActive: dto.isActive ?? true,
    });

    return Result.ok(UserResponseDto.fromEntity(user));
  }
}
