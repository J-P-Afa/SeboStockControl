'use client';

import { useEffect, useState } from 'react';
import { useAccessibilityStore } from '@/hooks/use-accessibility-store';

export function AccessibilityProvider() {
  const [mounted, setMounted] = useState(false);
  const { highContrast, fontSize } = useAccessibilityStore();

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply High Contrast
    if (highContrast) {
      root.setAttribute('data-accessibility', 'high-contrast');
    } else {
      root.removeAttribute('data-accessibility');
    }

    // Apply Font Size scaling
    root.style.fontSize = `${fontSize}%`;
  }, [mounted, highContrast, fontSize]);

  return null; // This component strictly handles side-effects on the DOM root
}
