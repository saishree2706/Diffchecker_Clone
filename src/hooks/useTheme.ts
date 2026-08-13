import { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (APP_CONFIG.DEFAULT_THEME === 'light') return 'light';
  if (APP_CONFIG.DEFAULT_THEME === 'dark') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return { theme, toggleTheme };
}
