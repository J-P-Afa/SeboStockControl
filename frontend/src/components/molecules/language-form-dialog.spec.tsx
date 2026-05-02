import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LanguageFormDialog } from './language-form-dialog';
import type { Language } from '@/types';

const language: Language = {
  id: 1,
  description: 'Portugues',
  isActive: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('LanguageFormDialog', () => {
  it('renders create mode defaults and validates required description', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <LanguageFormDialog open onOpenChange={vi.fn()} onSubmit={onSubmit} />,
    );

    expect(screen.getByRole('heading', { name: 'Novo Idioma' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Criar' })).toBeEnabled();
    expect(screen.queryByRole('checkbox', { name: 'Ativo' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Criar' }));

    expect(await screen.findByText('Descrição é obrigatória')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create mode values and closes the dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageFormDialog
        open
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText('Descrição'), 'Ingles');
    await user.click(screen.getByRole('button', { name: 'Criar' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: 'Ingles',
        isActive: true,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders edit mode values, loading state, active toggle, and cancel action', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageFormDialog
        open
        onOpenChange={onOpenChange}
        language={language}
        onSubmit={onSubmit}
        isLoading
      />,
    );

    expect(screen.getByRole('heading', { name: 'Editar Idioma' })).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toHaveValue('Portugues');
    expect(screen.getByRole('checkbox', { name: 'Ativo' })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
