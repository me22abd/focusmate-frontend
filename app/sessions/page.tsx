/**
 * ============================================================================
 * SESSIONS/PAGE.TSX - REDIRECT TO WORKSPACE
 * ============================================================================
 * 
 * Purpose: Redirects old /sessions route to new /sessions/workspace
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function SessionsPage() {
  useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    router.replace('/sessions/workspace');
  }, [router]);

  return null;
}
