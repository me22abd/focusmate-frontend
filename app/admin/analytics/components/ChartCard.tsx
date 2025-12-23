'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: boolean;
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  children,
  className,
  isLoading = false,
  error = false,
}: ChartCardProps) {
  return (
    <Card
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm',
        'transition-all duration-300 hover:shadow-md',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-slate-500 dark:text-slate-400">
              Loading chart data...
            </div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-sm text-red-600 dark:text-red-400">
              Failed to load chart data
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}






