import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';
import { axe } from 'jest-axe';

describe('Button Atom', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations when disabled', async () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should render the button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should apply the correct variant classes', () => {
    // Hero variant
    const { rerender } = render(<Button variant="hero">Hero</Button>);
    const heroButton = screen.getByRole('button');
    expect(heroButton).toHaveClass('from-primary');
    expect(heroButton).toHaveClass('to-primary/80');

    // Outline variant
    rerender(<Button variant="outline">Outline</Button>);
    const outlineButton = screen.getByRole('button');
    expect(outlineButton).toHaveClass('border-border');
    expect(outlineButton).toHaveClass('bg-background/50');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Clickable</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should show a loading state (spinner) when showLoading logic is applied externally', () => {
    // In our implementation, LoginPage handles the loader, but we can test if the button
    // correctly renders children which could include a loader.
    render(
      <Button disabled>
        <span data-testid="loader">Loading...</span>
      </Button>
    );
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
