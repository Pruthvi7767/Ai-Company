import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ThemeName = 'midnight' | 'obsidian' | 'slate' | 'emerald' | 'ruby' | 'amber';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
  borderAccent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentGlow: string;
  success: string;
  danger: string;
  info: string;
}

const themes: Record<ThemeName, ThemeColors> = {
  midnight: {
    background: '#0a0a0b',
    surface: 'rgba(255,255,255,0.04)',
    surfaceHover: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.08)',
    borderAccent: 'rgba(255,255,255,0.14)',
    text: '#ffffff',
    textSecondary: '#adadad',
    textMuted: '#666666',
    accent: '#e8a94e',
    accentGlow: 'rgba(232,169,78,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
  obsidian: {
    background: '#0b0f1a',
    surface: 'rgba(100,130,255,0.04)',
    surfaceHover: 'rgba(100,130,255,0.07)',
    border: 'rgba(100,130,255,0.08)',
    borderAccent: 'rgba(100,130,255,0.14)',
    text: '#ffffff',
    textSecondary: '#a0aec0',
    textMuted: '#4a5568',
    accent: '#6b8cff',
    accentGlow: 'rgba(107,140,255,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
  slate: {
    background: '#151b27',
    surface: 'rgba(148,163,184,0.06)',
    surfaceHover: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.1)',
    borderAccent: 'rgba(148,163,184,0.18)',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#475569',
    accent: '#e8a94e',
    accentGlow: 'rgba(232,169,78,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
  emerald: {
    background: '#0a1f14',
    surface: 'rgba(78,232,138,0.04)',
    surfaceHover: 'rgba(78,232,138,0.07)',
    border: 'rgba(78,232,138,0.08)',
    borderAccent: 'rgba(78,232,138,0.14)',
    text: '#ffffff',
    textSecondary: '#a7f3d0',
    textMuted: '#065f46',
    accent: '#4ee88a',
    accentGlow: 'rgba(78,232,138,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
  ruby: {
    background: '#1a0a0a',
    surface: 'rgba(255,100,100,0.04)',
    surfaceHover: 'rgba(255,100,100,0.07)',
    border: 'rgba(255,100,100,0.08)',
    borderAccent: 'rgba(255,100,100,0.14)',
    text: '#ffffff',
    textSecondary: '#fca5a5',
    textMuted: '#7f1d1d',
    accent: '#ff6464',
    accentGlow: 'rgba(255,100,100,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
  amber: {
    background: '#1a140a',
    surface: 'rgba(232,169,78,0.06)',
    surfaceHover: 'rgba(232,169,78,0.1)',
    border: 'rgba(232,169,78,0.1)',
    borderAccent: 'rgba(232,169,78,0.18)',
    text: '#fef3c7',
    textSecondary: '#d4a855',
    textMuted: '#78350f',
    accent: '#e8a94e',
    accentGlow: 'rgba(232,169,78,0.15)',
    success: '#4ee88a',
    danger: '#e84e68',
    info: '#4e8ee8',
  },
};

interface ThemeContextType {
  theme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'midnight',
  colors: themes.midnight,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('midnight');

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, colors: themes[theme], setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
