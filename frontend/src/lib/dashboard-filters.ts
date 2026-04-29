export const DASHBOARD_BOOK_ATTRIBUTES = [
  'classificacaoId',
  'genreId',
  'publisherId',
  'languageId',
  'condition',
  'status',
  'editionType',
] as const;

export type DashboardBookAttribute =
  (typeof DASHBOARD_BOOK_ATTRIBUTES)[number];

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  bookAttribute?: DashboardBookAttribute;
  bookAttributeValues?: string[];
}

export interface DashboardBookAttributeValue {
  value: string;
  label: string;
}

export const DASHBOARD_BOOK_ATTRIBUTE_OPTIONS: Array<{
  value: DashboardBookAttribute;
  label: string;
}> = [
  { value: 'classificacaoId', label: 'Classificação' },
  { value: 'genreId', label: 'Gênero' },
  { value: 'publisherId', label: 'Editora' },
  { value: 'languageId', label: 'Idioma' },
  { value: 'condition', label: 'Condição' },
  { value: 'status', label: 'Status' },
  { value: 'editionType', label: 'Edição' },
];

export function getDashboardBookAttributeLabel(
  attribute?: DashboardBookAttribute | null,
): string {
  if (!attribute) return 'Sem atributo';

  return (
    DASHBOARD_BOOK_ATTRIBUTE_OPTIONS.find((option) => option.value === attribute)
      ?.label ?? 'Sem atributo'
  );
}

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDefaultDashboardDateRange(now = new Date()): Required<
  Pick<DashboardFilters, 'startDate' | 'endDate'>
> {
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    startDate: formatDateInputValue(firstDayOfMonth),
    endDate: formatDateInputValue(now),
  };
}

export function buildDashboardSearchParams(
  filters?: DashboardFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  if (!filters) return params;

  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);

  const values =
    filters.bookAttributeValues?.filter((value) => value.trim().length > 0) ??
    [];

  if (filters.bookAttribute && values.length > 0) {
    params.set('bookAttribute', filters.bookAttribute);
    values.forEach((value) => params.append('bookAttributeValues', value));
  }

  return params;
}
