import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 
        ${
          isDark
            ? 'bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-700 hover:border-slate-600 shadow-sm'
            : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:border-slate-300 shadow-sm'
        } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
};

export default ThemeToggle;
