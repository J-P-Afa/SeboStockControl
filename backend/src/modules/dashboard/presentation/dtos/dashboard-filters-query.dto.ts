import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { DASHBOARD_BOOK_ATTRIBUTES } from '../../domain/dashboard.repository';

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const rawValues = Array.isArray(value) ? value : [value];
  const values = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

export class DashboardFiltersQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @IsOptional()
  @IsIn(DASHBOARD_BOOK_ATTRIBUTES)
  bookAttribute?: (typeof DASHBOARD_BOOK_ATTRIBUTES)[number];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsString({ each: true })
  bookAttributeValues?: string[];
}

export class DashboardBookAttributeValuesQueryDto {
  @IsIn(DASHBOARD_BOOK_ATTRIBUTES)
  attribute!: (typeof DASHBOARD_BOOK_ATTRIBUTES)[number];
}
