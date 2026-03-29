'use client';

import {
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { useBooks } from '@/hooks/use-books';
import { useDebounce } from '@/hooks/use-debounce';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { cn } from '@/lib/utils';
import { Condition } from '@/types';
import type { Book } from '@/types';

const SUGGESTION_LIMIT = 8;

interface BookSearchAutocompleteProps {
  value: string;
  condition?: Condition;
  onSelect: (book: Book) => void;
  onClear: () => void;
  onAddNew?: () => void;
  placeholder?: string;
  className?: string;
}

export function BookSearchAutocomplete({
  value,
  condition,
  onSelect,
  onClear,
  onAddNew,
  placeholder = "Buscar por ISBN, título ou autor...",
  className,
}: BookSearchAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedTerm = useDebounce(inputValue, 300);

  const { data: suggestions, isLoading } = useBooks(
    1,
    SUGGESTION_LIMIT,
    undefined,
    undefined,
    {
      search: debouncedTerm,
      condition,
      isActive: true,
    },
    {
      enabled: debouncedTerm.length >= 2,
    }
  );

  const items = suggestions?.items ?? [];

  const handleSelect = useCallback(
    (book: Book) => {
      setInputValue(book.title);
      onSelect(book);
    },
    [onSelect]
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
      setOpen(val.length >= 2);
    },
    [setOpen]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setOpen(false);
    onClear();
  }, [onClear, setOpen]);

  const showDropdown = open && inputValue.length >= 2;

  return (
    <div ref={containerRef} className={cn("relative flex-1", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-8 pr-8 h-10"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
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
          role="listbox"
          className="absolute z-50 mt-1 w-full max-h-80 overflow-auto rounded-lg border bg-popover p-1 shadow-md ring-1 ring-foreground/10 animate-in fade-in zoom-in-95 duration-100"
        >
          {items.length > 0 ? (
            items.map((book, index) => (
              <li
                key={book.id}
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
                  handleSelect(book);
                  setOpen(false);
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-medium truncate">{book.title}</span>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                    book.condition === Condition.NOVO ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {book.condition}
                  </span>
                </div>
                <div className="flex flex-col text-xs text-muted-foreground gap-0.5 mt-1 border-t pt-1 border-dashed">
                  <div className="flex justify-between items-center text-[10px] tracking-tight">
                    <span>ISBN: {book.isbn13 || book.isbn10 || '-'}</span>
                    <span>Volume: {book.volume || '-'}</span>
                  </div>
                </div>
              </li>
            ))
          ) : !isLoading && (
            <div className="p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Nenhum livro encontrado.</p>
              {onAddNew && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    onAddNew();
                    setOpen(false);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Novo Livro
                </Button>
              )}
            </div>
          )}
          {isLoading && (
            <div className="p-4 text-center">
              <span className="text-sm text-muted-foreground">Buscando...</span>
            </div>
          )}
        </ul>
      )}
    </div>
  );
}
