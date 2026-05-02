import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  calculateNetMarginPercent,
  ChartMetricTooltip,
} from './chart-metric-tooltip';

describe('ChartMetricTooltip', () => {
  it('calculates net margin and guards against zero sales', () => {
    expect(calculateNetMarginPercent(200, 50)).toBe(25);
    expect(calculateNetMarginPercent(0, 50)).toBe(0);
  });

  it('renders optional title, color indicator, quantity, and formatted metrics', () => {
    render(
      <ChartMetricTooltip
        title="Resumo"
        rows={[
          {
            label: 'Ficcao',
            totalSales: 200,
            netProfit: 50,
            color: '#00BFA5',
            quantity: 3,
          },
        ]}
      />,
    );

    expect(screen.getByText('Resumo')).toBeInTheDocument();
    expect(screen.getByText('Ficcao')).toBeInTheDocument();
    expect(screen.getByText('3 un.')).toBeInTheDocument();
    expect(screen.getByText('Faturamento:')).toBeInTheDocument();
    expect(screen.getByText('Lucro líquido:')).toBeInTheDocument();
    expect(screen.getByText('Margem líquida:')).toBeInTheDocument();
    expect(screen.getByText('25,0%')).toBeInTheDocument();
  });

  it('renders rows without optional title, color, or quantity', () => {
    render(
      <ChartMetricTooltip
        rows={[
          {
            label: 'Sem vendas',
            totalSales: 0,
            netProfit: 0,
          },
        ]}
      />,
    );

    expect(screen.queryByText('Resumo')).not.toBeInTheDocument();
    expect(screen.getByText('Sem vendas')).toBeInTheDocument();
    expect(screen.getByText('0,0%')).toBeInTheDocument();
  });
});
