import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Popover,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from './popover';

describe('Popover Molecule', () => {
  it('should render popover header, title and description correctly', () => {
    render(
      <Popover open>
        <PopoverHeader className="custom-header">
          <PopoverTitle className="custom-title">Title Text</PopoverTitle>
          <PopoverDescription className="custom-desc">Description Text</PopoverDescription>
        </PopoverHeader>
      </Popover>
    );

    const title = screen.getByText('Title Text');
    const desc = screen.getByText('Description Text');

    expect(title).toBeInTheDocument();
    expect(desc).toBeInTheDocument();
    
    // Check classes
    expect(title).toHaveClass('custom-title');
    expect(desc).toHaveClass('custom-desc');
    expect(title.parentElement).toHaveClass('custom-header');
  });
});
