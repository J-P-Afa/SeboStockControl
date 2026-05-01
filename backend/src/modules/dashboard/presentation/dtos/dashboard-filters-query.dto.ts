import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import {
  DASHBOARD_BOOK_ATTRIBUTES,
  SALES_COMPARISON_DIMENSIONS,
} from '../../domain/dashboard.repository';

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const rawValues = Array.isArray(value) ? value : [value];
  const values = rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function toPositiveIntArray(value: unknown): number[] | undefined {
  const values = toStringArray(value)
    ?.map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  return values && values.length > 0 ? values : undefined;
}

export class DashboardFiltersQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string;

  @IsOptional()
  @Transform(({ value }: TransformFnParams): string | undefined =>
    typeof value === 'string' ? value.trim() || undefined : undefined,
  )
  @IsString()
  search?: string;

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

export class SalesComparisonQueryDto extends DashboardFiltersQueryDto {
  @IsIn(SALES_COMPARISON_DIMENSIONS)
  dimension!: (typeof SALES_COMPARISON_DIMENSIONS)[number];

  @IsOptional()
  @Transform(({ value }) => toPositiveIntArray(value))
  @IsInt({ each: true })
  @Min(1, { each: true })
  groupIds?: number[];
}
