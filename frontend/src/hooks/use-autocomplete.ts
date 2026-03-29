import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react';

interface UseAutocompleteProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  onClose?: () => void;
}

/**
 * Headless hook to manage autocomplete state, focus, and keyboard navigation.
 */
export function useAutocomplete<T>({
  items,
  onSelect,
  onClose,
}: UseAutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setHighlightedIndex(-1);
    });
  }, [items]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open || items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < items.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : items.length - 1
          );
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < items.length) {
            onSelect(items[highlightedIndex]);
            setOpen(false);
          }
          break;
        }
        case 'Escape': {
          setOpen(false);
          onClose?.();
          break;
        }
      }
    },
    [open, items, highlightedIndex, onSelect, onClose]
  );

  return {
    open,
    setOpen,
    highlightedIndex,
    setHighlightedIndex,
    containerRef,
    listRef,
    handleKeyDown,
  };
}
