import { IsEnum } from 'class-validator';
import type { ThemePreference } from '../../domain/entities/user.entity';

/** Runtime enum for validation. Keeps application layer free of Prisma. */
const ThemePreferenceEnum = {
  SYSTEM: 'SYSTEM',
  LIGHT: 'LIGHT',
  DARK: 'DARK',
} as const;

export class UpdateMyPreferencesDto {
  @IsEnum(ThemePreferenceEnum, {
    message: 'themePreference must be one of: SYSTEM, LIGHT, DARK',
  })
  themePreference!: ThemePreference;
}
