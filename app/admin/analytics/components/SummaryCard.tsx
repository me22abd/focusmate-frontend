'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change (positive or negative)
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  className,
}: SummaryCardProps) {
  const hasIncrease = change !== undefined && change > 0;
  const hasDecrease = change !== undefined && change < 0;
  const changeValue = change !== undefined ? Math.abs(change) : null;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1',
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl',
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {changeValue !== null && (
              <div className="flex items-center gap-1">
                {hasIncrease ? (
                  <>
                    <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-500" />
                    <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                      +{changeValue.toFixed(1)}%
                    </span>
                  </>
                ) : hasDecrease ? (
                  <>
                    <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-500" />
                    <span className="text-sm font-semibold text-red-600 dark:text-red-500">
                      -{changeValue.toFixed(1)}%
                    </span>
                  </>
                ) : null}
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                  vs last week
                </span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
              'bg-slate-100 dark:bg-slate-800',
              iconColor.includes('blue') && 'bg-blue-50 dark:bg-blue-950',
              iconColor.includes('green') && 'bg-green-50 dark:bg-green-950',
              iconColor.includes('purple') && 'bg-purple-50 dark:bg-purple-950',
              iconColor.includes('orange') && 'bg-orange-50 dark:bg-orange-950',
              iconColor.includes('pink') && 'bg-pink-50 dark:bg-pink-950',
              iconColor.includes('indigo') && 'bg-indigo-50 dark:bg-indigo-950'
            )}
          >
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}












