import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CanalVendaFormDialog } from './canal-venda-form-dialog';
import type { CanalVenda } from '@/types';

const canalVenda: CanalVenda = {
  id: 1,
  descricao: 'Loja fisica',
  comissaoFixa: 0,
  comissaoVariavel: 2.5,
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('CanalVendaFormDialog', () => {
  it('validates required create fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CanalVendaFormDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('heading', { name: 'Novo Canal de Venda' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create mode values and closes the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <CanalVendaFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'Marketplace');
    await user.clear(screen.getByLabelText('Taxa (%)'));
    await user.type(screen.getByLabelText('Taxa (%)'), '12.5');
    await user.click(screen.getByRole('checkbox', { name: 'Ativo' }));
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        descricao: 'Marketplace',
        comissaoVariavel: 12.5,
        isActive: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <CanalVendaFormDialog
        open
        onOpenChange={onOpenChange}
        canalVenda={canalVenda}
        onSubmit={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Canal de Venda' })).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Loja fisica');
    expect(screen.getByLabelText('Taxa (%)')).toHaveValue(250);
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
