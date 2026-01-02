'use client';

import { useEffect } from 'react';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

/**
 * Assistant Page - Full Page Route
 * 
 * This page renders the AI assistant as a full page instead of an overlay.
 * This prevents background scrolling issues and provides a cleaner experience.
 */
export default function AssistantPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Don't render until we know auth status
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <AssistantChat 
        isOpen={true}
        onClose={() => router.push('/dashboard')}
        userName={user.name || 'there'}
      />
    </div>
  );
}

