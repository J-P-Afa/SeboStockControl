import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Public, CurrentUser } from '../../../common';
import { LoginDto, RefreshTokenDto } from '../application/dtos';
import {
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from '../application/use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: RefreshTokenDto,
  ) {
    return this.logoutUseCase.execute(userId, dto.refreshToken);
  }
}
