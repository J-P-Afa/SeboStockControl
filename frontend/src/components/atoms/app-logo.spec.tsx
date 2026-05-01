import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppLogo } from './app-logo';

describe('AppLogo', () => {
  it('renders with default variant (full)', () => {
    render(<AppLogo />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    expect(logo).toBeInTheDocument();
    // full variant uses root size class
    expect(logo.className).toMatch(/h-16/);
  });

  it('renders with mark variant', () => {
    render(<AppLogo variant="mark" />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    // mark variant uses mark size class
    expect(logo.className).toMatch(/h-12/);
  });

  it('renders with sm size', () => {
    render(<AppLogo size="sm" />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    expect(logo.className).toMatch(/h-12/);
  });

  it('renders with lg size', () => {
    render(<AppLogo size="lg" />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    expect(logo.className).toMatch(/h-56/);
  });

  it('eagerly loads the logo because it appears above the fold', () => {
    render(<AppLogo />);
    const image = screen.getByRole('presentation');
    expect(image).toHaveAttribute('loading', 'eager');
  });

  it('applies custom className', () => {
    render(<AppLogo className="my-custom-class" />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    expect(logo.className).toContain('my-custom-class');
  });

  it('renders mark variant with sm size', () => {
    render(<AppLogo variant="mark" size="sm" />);
    const logo = screen.getByRole('img', { name: /sebo alfa/i });
    expect(logo).toBeInTheDocument();
  });
});
