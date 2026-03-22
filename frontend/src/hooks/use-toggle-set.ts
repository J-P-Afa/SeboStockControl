import { useCallback } from 'react';

/**
 * Headless util hook to manage a set of selected string IDs or comparable items.
 */
export function useToggleSet<T>(
  selectedItems: T[],
  onChange: (items: T[]) => void
) {
  const toggleItem = useCallback(
    (item: T) => {
      const isSelected = selectedItems.includes(item);
      const nextItems = isSelected
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item];
      onChange(nextItems);
    },
    [selectedItems, onChange]
  );

  return { toggleItem };
}
