import { createContext } from 'react';
import type { ThemePreference } from './themeStorage';

export type ThemeContextValue = {
  resolved: ThemePreference;
  stored: ThemePreference | null;
  setStored: (value: ThemePreference | null) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
