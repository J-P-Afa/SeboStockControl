import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TipoEntradaFormDialog } from './tipo-entrada-form-dialog';
import type { TipoEntrada } from '@/types';

const tipoEntrada: TipoEntrada = {
  id: 1,
  descricao: 'Doacao',
  isDoacao: true,
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('TipoEntradaFormDialog', () => {
  it('renders create mode defaults and validates required name', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TipoEntradaFormDialog
        open
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Novo Tipo de Entrada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Doação recebida' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).toBeChecked();

    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create mode values and closes the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TipoEntradaFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Nome'), 'Compra');
    await user.click(screen.getByRole('checkbox', { name: 'Doação recebida' }));
    await user.click(screen.getByRole('checkbox', { name: 'Ativo' }));
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        descricao: 'Compra',
        isDoacao: true,
        isActive: false,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <TipoEntradaFormDialog
        open
        onOpenChange={onOpenChange}
        tipoEntrada={tipoEntrada}
        onSubmit={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Tipo de Entrada' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveValue('Doacao');
    expect(screen.getByRole('checkbox', { name: 'Doação recebida' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
