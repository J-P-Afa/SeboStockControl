'use client';

import { Monitor, Moon, Palette, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms/button';
import { updateMyPreferences } from '@/lib/api';
import type { ThemePreference } from '@/types';

const THEME_OPTIONS: Array<{
  value: 'system' | 'light' | 'dark';
  apiValue: ThemePreference;
  label: string;
  icon: typeof Monitor;
}> = [
    { value: 'system', apiValue: 'SYSTEM', label: 'Sistema', icon: Monitor },
    { value: 'light', apiValue: 'LIGHT', label: 'Claro', icon: Sun },
    { value: 'dark', apiValue: 'DARK', label: 'Escuro', icon: Moon },
  ];

function CurrentThemeIcon({
  theme,
  compact,
}: {
  theme: string | undefined;
  compact: boolean;
}) {
  const option = THEME_OPTIONS.find((o) => o.value === (theme ?? 'system'));
  const Icon = option?.icon ?? Palette;
  if (compact) return <Icon className="h-4 w-4 shrink-0" aria-hidden />;
  return <Icon className="h-4 w-4 shrink-0" aria-hidden />;
}

export interface ThemeSwitcherProps {
  /** When true, only icons are shown (e.g. sidebar collapsed). */
  compact?: boolean;
  className?: string;
}

/**
 * Single theme widget: shows "Tema" (or icon when compact). On hover, reveals three options (Sistema, Claro, Escuro).
 * Persists choice via PATCH /users/me/preferences.
 */
export function ThemeSwitcher({ compact = false, className }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  function handleSelect(value: 'system' | 'light' | 'dark', apiValue: ThemePreference) {
    setTheme(value);
    updateMyPreferences({ themePreference: apiValue }).catch(() => {
      setTheme(theme ?? 'system');
    });
  }

  return (
    <div
      className={cn(
        'group relative w-full rounded-md transition-colors',
        compact ? 'flex justify-center' : '',
        className,
      )}
      role="group"
      aria-label="Escolher tema"
    >
      {/* Trigger: always visible */}
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground',
          'hover:bg-accent/50 hover:text-accent-foreground',
          compact && 'justify-center px-2',
        )}
      >
        <CurrentThemeIcon theme={theme} compact={compact} />
        {!compact && <span className="truncate font-medium">Tema</span>}
      </div>

      {/* Options: submenu to the right on hover */}
      <div
        className={cn(
          'absolute left-full bottom-0 z-50 ml-1 flex min-w-[8rem] flex-col gap-0.5 rounded-md border bg-popover p-1.5 shadow-md',
          'invisible opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100',
        )}
      >
        {THEME_OPTIONS.map(({ value, apiValue, label, icon: Icon }) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            onClick={() => handleSelect(value, apiValue)}
            aria-pressed={theme === value}
            aria-label={label}
            title={label}
            className={cn(
              'justify-start gap-2',
              theme === value && 'bg-accent text-accent-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
