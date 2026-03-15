import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
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
    const result = await this.getMeUseCase.execute(req.user.id);

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result.data;
  }

  @Patch('me/preferences')
  async updateMyPreferences(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateMyPreferencesDto,
  ) {
    const result = await this.updateMyPreferencesUseCase.execute(
      req.user.id,
      dto.themePreference,
    );

    if (!result.success) {
      throw new NotFoundException(result.error);
    }

    return result.data;
  }
}
