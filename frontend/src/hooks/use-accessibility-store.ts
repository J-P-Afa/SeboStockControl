import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AccessibilityState {
  highContrast: boolean;
  fontSize: number; // 100, 112.5, 125, etc.
  toggleHighContrast: () => void;
  setFontSize: (size: number) => void;
  reset: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      highContrast: false,
      fontSize: 100, // default 100%
      toggleHighContrast: () =>
        set((state) => ({ highContrast: !state.highContrast })),
      setFontSize: (size) => set({ fontSize: size }),
      reset: () => set({ highContrast: false, fontSize: 100 }),
    }),
    {
      name: 'accessibility-storage', // key in localStorage
    }
  )
);
