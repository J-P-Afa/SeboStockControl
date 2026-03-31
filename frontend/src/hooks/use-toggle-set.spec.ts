import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useToggleSet } from './use-toggle-set';

describe('useToggleSet hook', () => {
  it('should add an item to the set if it does not exist', () => {
    const onChange = vi.fn();
    const selectedItems: string[] = ['1', '2'];
    const { result } = renderHook(() => useToggleSet(selectedItems, onChange));

    act(() => {
      result.current.toggleItem('3');
    });

    expect(onChange).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should remove an item from the set if it already exists', () => {
    const onChange = vi.fn();
    const selectedItems: string[] = ['1', '2', '3'];
    const { result } = renderHook(() => useToggleSet(selectedItems, onChange));

    act(() => {
      result.current.toggleItem('2');
    });

    expect(onChange).toHaveBeenCalledWith(['1', '3']);
  });
});
