'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Change theme"
      className="p-1.5 rounded border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:opacity-75 transition-opacity flex items-center justify-center cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-white" />
      ) : (
        <Moon className="w-4 h-4 text-black" />
      )}
    </button>
  );
}
