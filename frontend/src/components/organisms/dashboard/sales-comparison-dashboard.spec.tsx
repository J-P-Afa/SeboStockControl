import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SalesComparisonDashboard } from './sales-comparison-dashboard';
import { useSalesComparison } from '@/hooks/use-sales-comparison';
import type { SalesComparisonData } from '@/lib/api/dashboard.api';

vi.mock('@/hooks/use-sales-comparison', () => ({
  useSalesComparison: vi.fn(),
}));

vi.mock('recharts', () => {
  const Chart = ({ children }: { children?: ReactNode }) => (
    <div data-testid="chart">{children}</div>
  );
  const Passthrough = ({ children }: { children?: ReactNode }) => <>{children}</>;
  const Tooltip = ({
    content,
  }: {
    content?: (props: {
      active: boolean;
      payload?: Array<{ payload: Record<string, string | number> }>;
      label?: string;
    }) => ReactNode;
  }) => (
    <div data-testid="tooltip">
      {content?.({ active: false, payload: [] })}
      {content?.({
        active: true,
        label: '2026-05-01',
        payload: [
          {
            payload: {
              groupId: 1,
              groupLabel: 'Loja Centro',
              totalSales: 100,
              netProfit: 25,
              sales_1: 100,
              profit_1: 25,
              sales_2: 80,
              profit_2: 20,
            },
          },
        ],
      })}
    </div>
  );

  return {
    Bar: Passthrough,
    BarChart: Chart,
    CartesianGrid: Passthrough,
    Line: Passthrough,
    LineChart: Chart,
    ResponsiveContainer: Chart,
    Tooltip,
    XAxis: Passthrough,
    YAxis: Passthrough,
  };
});

const mockedUseSalesComparison = vi.mocked(useSalesComparison);

const options = [
  { id: 1, label: 'Loja Centro', isActive: true },
  { id: 2, label: 'Marketplace', isActive: true },
  { id: 3, label: 'Inativo', isActive: false },
];

const salesData: SalesComparisonData[] = [
  {
    date: '2026-05-01',
    groupId: 1,
    groupLabel: 'Loja Centro',
    totalSales: 100,
    netProfit: 25,
  },
  {
    date: '2026-05-01',
    groupId: 2,
    groupLabel: 'Marketplace',
    totalSales: 80,
    netProfit: -10,
  },
];

const manyOptions = [
  { id: 1, label: 'Loja Centro', isActive: true },
  { id: 2, label: 'Marketplace', isActive: true },
  { id: 3, label: 'Feira', isActive: true },
  { id: 4, label: 'Site', isActive: true },
  { id: 5, label: 'Balcao', isActive: true },
];

const manySalesData: SalesComparisonData[] = manyOptions.map((option) => ({
  date: '2026-05-01',
  groupId: option.id,
  groupLabel: option.label,
  totalSales: 100 - option.id,
  netProfit: 10,
}));

function renderDashboard(
  props: Partial<ComponentProps<typeof SalesComparisonDashboard>> = {},
) {
  return render(
    <SalesComparisonDashboard
      title="Comparativo"
      description="Vendas por canal"
      dimension="canalVenda"
      options={options}
      {...props}
    />,
  );
}

describe('SalesComparisonDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSalesComparison.mockReturnValue({
      data: salesData,
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSalesComparison>);
  });

  it('renders automatic top income groups and chart summaries', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Comparativo' })).toBeInTheDocument();
    expect(screen.getByText('Vendas por canal')).toBeInTheDocument();
    expect(screen.getByText('2 séries')).toBeInTheDocument();
    expect(screen.getAllByText('Loja Centro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Marketplace').length).toBeGreaterThan(0);
    expect(screen.getByText('Faturamento e margem')).toBeInTheDocument();
    expect(screen.getByText('Faturamento por dia')).toBeInTheDocument();
    expect(mockedUseSalesComparison).toHaveBeenCalledWith(
      expect.objectContaining({
        dimension: 'canalVenda',
        groupIds: [1, 2],
      }),
      true,
    );
  });

  it('shows fetching and error states', () => {
    mockedUseSalesComparison.mockReturnValue({
      data: [],
      isFetching: true,
      isError: true,
    } as unknown as ReturnType<typeof useSalesComparison>);

    renderDashboard();

    expect(screen.getByText('Atualizando...')).toBeInTheDocument();
    expect(
      screen.getByText('Não foi possível carregar o comparativo de vendas.'),
    ).toBeInTheDocument();
  });

  it('shows the automatic empty state when there is no income', () => {
    mockedUseSalesComparison.mockReturnValue({
      data: [],
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSalesComparison>);

    renderDashboard();

    expect(
      screen.getByText('Nenhuma categoria com faturamento no período.'),
    ).toBeInTheDocument();
  });

  it('keeps date ranges valid when start or end dates cross over', async () => {
    const user = userEvent.setup();

    const { container } = renderDashboard();

    const startDate = container.querySelector<HTMLInputElement>(
      '#canalVenda-comparison-start-date',
    );
    const endDate = container.querySelector<HTMLInputElement>(
      '#canalVenda-comparison-end-date',
    );

    expect(startDate).not.toBeNull();
    expect(endDate).not.toBeNull();

    await user.click(screen.getAllByRole('button', { name: 'Selecionar data' })[0]);
    await user.click(screen.getByRole('button', { name: '20' }));

    expect(endDate).toHaveValue('2026-05-20');

    await user.click(screen.getAllByRole('button', { name: 'Selecionar data' })[1]);
    await user.click(screen.getByRole('button', { name: '10' }));

    expect(startDate).toHaveValue('2026-05-10');
  });

  it('resets filters back to automatic selection', async () => {
    const user = userEvent.setup();

    const { container } = renderDashboard();

    const startDate = container.querySelector<HTMLInputElement>(
      '#canalVenda-comparison-start-date',
    );

    expect(startDate).not.toBeNull();

    await user.click(screen.getAllByRole('button', { name: 'Selecionar data' })[0]);
    await user.click(screen.getByRole('button', { name: '20' }));
    await user.click(screen.getByRole('button', { name: /Redefinir/i }));

    expect(screen.getByText('2 séries')).toBeInTheDocument();
    expect(startDate).not.toHaveValue('2026-05-20');
  });

  it('disables comparison picker while options are loading', () => {
    renderDashboard({ isLoadingOptions: true });

    expect(screen.getByRole('button', { name: /selecionados/i })).toBeDisabled();
  });

  it('limits manual comparison to four groups and can clear or restore automatic top groups', async () => {
    const user = userEvent.setup();
    mockedUseSalesComparison.mockReturnValue({
      data: manySalesData,
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSalesComparison>);

    renderDashboard({ options: manyOptions });

    await user.click(screen.getByRole('button', { name: /4 selecionados/i }));

    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes).toHaveLength(5);
    expect(checkboxes[4]).toHaveAttribute('aria-disabled', 'true');

    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(
      screen.getByText('Selecione pelo menos uma categoria para comparar.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Top 4' }));

    expect(screen.getByText('4 séries')).toBeInTheDocument();
  });
});
