import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox Atom', () => {
  it('should render the checkbox correctly', () => {
    render(<Checkbox aria-label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: /accept terms/i })).toBeInTheDocument();
  });

  it('should be checked when defaultChecked is true', () => {
    render(<Checkbox defaultChecked aria-label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: /accept terms/i })).toHaveAttribute('data-checked', '');
  });

  it('should be disabled when disabled prop is provided', () => {
    render(<Checkbox disabled aria-label="Accept terms" />);
    expect(screen.getByRole('checkbox', { name: /accept terms/i })).toHaveAttribute('aria-disabled', 'true');
  });
});
