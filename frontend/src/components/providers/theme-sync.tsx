'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/use-auth';
import { getMe } from '@/lib/api';

/**
 * Syncs theme from backend when user is logged in. Runs once per user session.
 * Must be mounted inside ThemeProvider and AuthProvider.
 */
export function ThemeSync() {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      hasSyncedRef.current = false;
      return;
    }
    if (hasSyncedRef.current) return;

    hasSyncedRef.current = true;
    getMe()
      .then((me) => {
        if (me.themePreference) {
          setTheme(me.themePreference.toLowerCase());
        }
      })
      .catch(() => {
        hasSyncedRef.current = false;
      });
  }, [user, setTheme]);

  return null;
}
