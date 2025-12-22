/**
 * ============================================================================
 * PAGE-HEADER.TSX - REUSABLE PAGE HEADER WITH NAVIGATION
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom component for consistent navigation across all pages.
 * Provides back button, home button, and page title in a reusable format.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  emoji?: string;
  showBack?: boolean;
  showHome?: boolean;
  backUrl?: string;
  homeUrl?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  emoji,
  showBack = true,
  showHome = true,
  backUrl,
  homeUrl = '/dashboard',
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push(homeUrl);
  };

  return (
    <div className={cn(
      'border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10',
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          <div className="flex items-center gap-2">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            {showHome && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHome}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            )}
          </div>

          {/* Center: Title */}
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent flex items-center gap-2">
            {emoji && <span>{emoji}</span>}
            {title}
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {actions || <div className="w-20" />}
          </div>
        </div>
      </div>
    </div>
  );
}








