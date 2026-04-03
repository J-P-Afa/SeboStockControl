import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards';
import {
  GetMeUseCase,
  UpdateMyPreferencesUseCase,
} from '../application/use-cases';
import { UpdateMyPreferencesDto } from '../application/dtos';

interface RequestWithUser extends Request {
  user: { id: string; email: string; role: string; permissions: string[] };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMyPreferencesUseCase: UpdateMyPreferencesUseCase,
  ) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    return this.getMeUseCase.execute(req.user.id);
  }

  @Patch('me/preferences')
  async updateMyPreferences(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateMyPreferencesDto,
  ) {
    return this.updateMyPreferencesUseCase.execute(
      req.user.id,
      dto.themePreference,
    );
  }
}
