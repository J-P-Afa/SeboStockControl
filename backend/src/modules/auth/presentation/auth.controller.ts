import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public } from '../../../common';
import { LoginDto, RefreshTokenDto } from '../application/dtos';
import { LoginUseCase, RefreshTokenUseCase } from '../application/use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto.email, dto.password);

    if (!result.success) {
      throw new UnauthorizedException(result.error);
    }

    return result.data;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.refreshTokenUseCase.execute(dto.refreshToken);

    if (!result.success) {
      throw new UnauthorizedException(result.error);
    }

    return result.data;
  }
}
