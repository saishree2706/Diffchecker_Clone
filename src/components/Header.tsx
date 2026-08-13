import { Moon, Sun, GitCompare } from 'lucide-react';
import { APP_CONFIG } from '../config';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <div className="flex items-center gap-2">
        <GitCompare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">
          {APP_CONFIG.APP_NAME}
        </span>
        <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-600">
          v{APP_CONFIG.APP_VERSION}
        </span>
      </div>
      <button
        onClick={onToggleTheme}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
    </header>
  );
}
