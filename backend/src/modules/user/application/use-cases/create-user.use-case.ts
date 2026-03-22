import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../common';
import type { IHashProvider } from '../../application/providers/hash.provider.interface';
import { HASH_PROVIDER } from '../../application/providers/hash.provider.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto, UserResponseDto } from '../dtos';

/**
 * Caso de Uso: Criação de Usuário
 * 
 * Este serviço orquestra a criação de novos usuários no sistema, 
 * garantindo a unicidade do e-mail e a criptografia da senha.
 * 
 * @ai-context Segue o Result Pattern para evitar exceções de fluxo controlado.
 * @side-effects Persiste dados no Repositório de Usuários.
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(HASH_PROVIDER)
    private readonly hashProvider: IHashProvider,
  ) { }

  /**
   * Executa a lógica de criação do usuário.
   * 
   * @param dto Dados de entrada validados pelo DTO.
   * @returns Um objeto Result contendo o DTO de resposta ou erro de domínio.
   * @throws Nunca lança exceções explicitamente (usa Result Pattern).
   */
  async execute(dto: CreateUserDto): Promise<Result<UserResponseDto>> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      return Result.fail('USER_EMAIL_EXISTS', 'A user with this email already exists');
    }

    const hashedPassword = await this.hashProvider.hash(dto.password);

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
