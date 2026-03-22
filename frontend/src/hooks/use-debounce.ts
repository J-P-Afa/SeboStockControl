import { useEffect, useState } from 'react';

/**
 * Delays updating a value until after `delay` ms of inactivity.
 * Useful for search inputs that trigger network requests.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
