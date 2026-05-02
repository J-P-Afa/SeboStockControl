import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FormaPagamentoFormDialog } from './forma-pagamento-form-dialog';
import type { FormaPagamento } from '@/types';

const formaPagamento: FormaPagamento = {
  id: 1,
  descricao: 'Pix',
  taxa: 1.5,
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('FormaPagamentoFormDialog', () => {
  it('validates required create fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FormaPagamentoFormDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('heading', { name: 'Nova Forma de Pagamento' })).toBeInTheDocument();
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
      <FormaPagamentoFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'Cartao');
    await user.clear(screen.getByLabelText('Taxa (%)'));
    await user.type(screen.getByLabelText('Taxa (%)'), '3.25');
    await user.click(screen.getByRole('checkbox', { name: 'Ativo' }));
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        descricao: 'Cartao',
        taxa: 3.25,
        isActive: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <FormaPagamentoFormDialog
        open
        onOpenChange={onOpenChange}
        formaPagamento={formaPagamento}
        onSubmit={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Forma de Pagamento' })).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Pix');
    expect(screen.getByLabelText('Taxa (%)')).toHaveValue(150);
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
