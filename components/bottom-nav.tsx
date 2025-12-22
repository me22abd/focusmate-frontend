'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Timer, BarChart3, Clock, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Session', href: '/sessions/workspace', Icon: Timer },
  { label: 'Focus', href: '/focus', Icon: Clock },
  { label: 'Game', href: '/game', Icon: Gamepad2 },
  { label: 'Analytics', href: '/analytics', Icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/80 safe-area-inset-bottom">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 sm:px-4 py-2 sm:py-3">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={cn(
                'group relative flex flex-col items-center gap-0.5 sm:gap-1 rounded-2xl px-2 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 touch-manipulation',
                'active:scale-95 hover:scale-105 hover:shadow-md hover:shadow-indigo-500/20',
                isActive
                  ? 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
              aria-label={item.label}
            >
              {/* Active indicator - gradient underline */}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400" />
              )}
              
              <item.Icon
                className={cn(
                  'h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400'
                )}
              />
              <span
                className={cn(
                  'text-[10px] sm:text-xs font-medium transition-colors duration-200',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}





