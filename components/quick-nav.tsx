/**
 * ============================================================================
 * QUICK-NAV.TSX - FLOATING NAVIGATION BUTTONS
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom floating action buttons for easy navigation.
 * Provides quick access to Back and Home without modifying page layouts.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface QuickNavProps {
  showBack?: boolean;
  showHome?: boolean;
  backUrl?: string;
  homeUrl?: string;
}

export function QuickNav({
  showBack = true,
  showHome = true,
  backUrl,
  homeUrl = '/dashboard',
}: QuickNavProps) {
  const router = useRouter();

  return (
    <div className="fixed top-20 left-4 z-50 flex flex-col gap-2">
      {showBack && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => backUrl ? router.push(backUrl) : router.back()}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
          title="Go Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      
      {showHome && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push(homeUrl)}
          className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
          title="Go to Dashboard"
        >
          <Home className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}















