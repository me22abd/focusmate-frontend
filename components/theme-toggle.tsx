'use client';

import { Moon, Sun, Eye, Sparkles, Sunset } from 'lucide-react';
import { useEffect, useState } from 'react';

const themes = [
  { name: 'Light Mode', icon: Sun, value: 'light' },
  { name: 'Dark Mode', icon: Moon, value: 'dark' },
  { name: 'True Tone', icon: Sparkles, value: 'true-tone' },
  { name: 'Night Shift', icon: Sunset, value: 'night-shift' },
];

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has a preference
    const savedTheme = localStorage.getItem('theme');
    const themeIndex = themes.findIndex(t => t.value === savedTheme);
    
    if (themeIndex !== -1) {
      setCurrentTheme(themeIndex);
      applyTheme(themeIndex);
    } else {
      // Default to light mode
      setCurrentTheme(0);
    }
  }, []);

  const applyTheme = (index: number) => {
    const theme = themes[index];
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'true-tone', 'night-shift');
    
    // Apply selected theme
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme.value === 'true-tone') {
      document.documentElement.classList.add('true-tone');
    } else if (theme.value === 'night-shift') {
      document.documentElement.classList.add('night-shift', 'dark');
    }
    
    localStorage.setItem('theme', theme.value);
  };

  const handleThemeChange = (index: number) => {
    setCurrentTheme(index);
    applyTheme(index);
    setIsOpen(false);
  };

  const CurrentIcon = themes[currentTheme].icon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="theme-toggle-btn rounded-full p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="theme-dropdown absolute right-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
            {themes.map((theme, index) => {
              const Icon = theme.icon;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(index)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${
                    index === currentTheme ? 'bg-[#5B4FF6]/10 text-[#5B4FF6] dark:text-[#7c4dff]' : 'text-slate-700 dark:text-slate-300'
                  } ${index === 0 ? 'rounded-t-xl' : ''} ${index === themes.length - 1 ? 'rounded-b-xl' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  {theme.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

