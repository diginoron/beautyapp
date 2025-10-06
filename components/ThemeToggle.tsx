import React from 'react';
import { SunIcon, MoonIcon } from './icons';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">حالت نمایش</span>
            <button
                onClick={toggleTheme}
                className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-slate-300 dark:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                <span
                    className={`${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform flex items-center justify-center`}
                >
                    {theme === 'dark' ? (
                        <MoonIcon className="h-3 w-3 text-slate-600" />
                    ) : (
                        <SunIcon className="h-3 w-3 text-amber-500" />
                    )}
                </span>
            </button>
        </div>
    );
};

export default ThemeToggle;
