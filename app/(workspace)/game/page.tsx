'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function GamePage() {
  useAuthGuard();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard by default
    router.replace('/game/dashboard');
  }, [router]);

  return null;
}






