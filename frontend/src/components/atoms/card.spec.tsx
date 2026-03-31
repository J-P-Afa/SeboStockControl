import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

describe('Card Atom', () => {
  it('should render all card components correctly', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
          <CardAction><button>Action</button></CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('should render card parts with custom class names', () => {
    render(
      <Card data-testid="test-card" className="custom-card">
        <CardHeader data-testid="test-header" className="custom-header" />
        <CardContent data-testid="test-content" className="custom-content" />
        <CardFooter data-testid="test-footer" className="custom-footer" />
      </Card>
    );
    
    expect(screen.getByTestId('test-card')).toHaveClass('custom-card');
    expect(screen.getByTestId('test-header')).toHaveClass('custom-header');
    expect(screen.getByTestId('test-content')).toHaveClass('custom-content');
    expect(screen.getByTestId('test-footer')).toHaveClass('custom-footer');
  });

  it('should apply size classes correctly', () => {
    const { rerender } = render(<Card data-testid="card" size="sm">Small Card</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'sm');
    
    rerender(<Card data-testid="card" size="default">Default Card</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'default');
  });
});
