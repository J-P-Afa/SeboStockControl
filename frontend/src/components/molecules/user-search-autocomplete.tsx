'use client';

import {
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { useUsers } from '@/hooks/use-users';
import { useDebounce } from '@/hooks/use-debounce';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

const SUGGESTION_LIMIT = 8;

/**
 * Props for the UserSearchAutocomplete component.
 */
interface UserSearchAutocompleteProps {
  /** The current search value (controlled). */
  value: string;
  /** Optional array of role IDs to filter users. */
  roleIds?: string[];
  /** Optional flag to filter by active/inactive status. */
  isActive?: boolean;
  /** 
   * Callback executed when a filter change occurs.
   * Called only when the user selects a suggestion or clears the field. 
   */
  onFilterChange: (search: string) => void;
}

/**
 * A specialized autocomplete component for searching users by name or email.
 * 
 * @component
 * @example
 * <UserSearchAutocomplete 
 *   value={filter} 
 *   onFilterChange={(val) => setFilter(val)} 
 * />
 * 
 * @description
 * This component uses a debounced search to fetch suggestions from the backend.
 * It follows Atomic Design principles as a "Molecule" and implements
 * WAI-ARIA combobox patterns for accessibility.
 * 
 * @ai-context: This component relies on `useUsers` and `useAutocomplete` hooks for its logic.
 */
export function UserSearchAutocomplete({
  value,
  roleIds,
  isActive,
  onFilterChange,
}: UserSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedTerm = useDebounce(inputValue, 300);

  const { data: suggestions } = useUsers(
    1,
    SUGGESTION_LIMIT,
    undefined,
    undefined,
    {
      search: debouncedTerm,
      roleIds,
      isActive,
    },
    {
      enabled: debouncedTerm.length >= 1,
    }
  );

  const items = suggestions?.items ?? [];

  const handleSelect = useCallback(
    (user: User) => {
      setInputValue(user.name);
      onFilterChange(user.name);
    },
    [onFilterChange]
  );

  const {
    open,
    setOpen,
    highlightedIndex,
    setHighlightedIndex,
    containerRef,
    listRef,
    handleKeyDown,
  } = useAutocomplete({
    items,
    onSelect: handleSelect,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setOpen(val.length >= 1);
    },
    [setOpen]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setOpen(false);
    onFilterChange('');
  }, [onFilterChange, setOpen]);

  const showDropdown = open && inputValue.length >= 1 && items.length > 0;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-[200px]">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 1 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar por nome ou e-mail..."
          className="pl-8 pr-8"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="user-search-listbox"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          id="user-search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-lg border bg-popover p-1 shadow-md ring-1 ring-foreground/10"
        >
          {items.map((user, index) => (
            <li
              key={user.id}
              role="option"
              aria-selected={highlightedIndex === index}
              className={cn(
                'flex flex-col gap-0.5 rounded-md px-2.5 py-1.5 text-sm cursor-pointer transition-colors',
                highlightedIndex === index
                  ? 'bg-muted text-foreground'
                  : 'text-popover-foreground hover:bg-muted/50'
              )}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(user);
                setOpen(false);
              }}
            >
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
