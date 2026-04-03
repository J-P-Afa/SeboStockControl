import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
} from './application/use-cases';
import { JwtStrategy } from './infrastructure/strategies';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, RefreshTokenUseCase, LogoutUseCase, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
