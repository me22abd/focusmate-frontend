/**
 * Assistant Bubble Component
 * Floating chat button that appears on authenticated pages
 * Features: glow pulse animation, mascot avatar, click to open chat
 */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AssistantChat } from './AssistantChat';
import { FocusAIMascot } from '@/components/mascot/FocusAIMascot';
import { cn } from '@/lib/utils';

export function AssistantBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    // Load saved position from localStorage
    const savedPosition = localStorage.getItem('assistant-bubble-position');
    if (savedPosition) {
      try {
        const { x, y } = JSON.parse(savedPosition);
        setPosition({ x, y });
      } catch (e) {
        // Invalid saved position, use default
        setPosition({ x: 0, y: 0 });
      }
    }
  }, []);

  // Handle drag to update position smoothly
  const handleDrag = (event: any, info: any) => {
    // Update drag offset during drag for smooth visual feedback
    setDragOffset({ x: info.offset.x, y: info.offset.y });
  };

  // Save position to localStorage when drag ends
  const handleDragEnd = (event: any, info: any) => {
    const newX = position.x + dragOffset.x;
    const newY = position.y + dragOffset.y;
    const newPosition = { x: newX, y: newY };
    setPosition(newPosition);
    setDragOffset({ x: 0, y: 0 }); // Reset offset
    localStorage.setItem('assistant-bubble-position', JSON.stringify(newPosition));
  };

  // Public pages where assistant should NOT appear
  const publicPages = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/privacy',
    '/terms',
  ];

  const isPublicPage = publicPages.some((page) => {
    if (page === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname?.startsWith(page);
  });

  // Don't render on server, if not authenticated, or on public pages
  if (!mounted || !isAuthenticated || isPublicPage) {
    return null;
  }

  return (
    <>
      {/* Floating Bubble Button - Draggable */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        initial={{ scale: 0, opacity: 0, x: position.x, y: position.y }}
        animate={{ 
          scale: 1, 
          opacity: 1,
          x: position.x + dragOffset.x,
          y: position.y + dragOffset.y,
        }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{
          left: typeof window !== 'undefined' ? -window.innerWidth + 100 : -1000,
          right: typeof window !== 'undefined' ? window.innerWidth - 100 : 1000,
          top: typeof window !== 'undefined' ? -window.innerHeight + 100 : -1000,
          bottom: typeof window !== 'undefined' ? window.innerHeight - 100 : 1000,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.3,
        }}
      >
        {/* Glow Pulse Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/40 via-blue-400/40 to-cyan-400/40 blur-xl"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Button */}
        <motion.button
          onClick={() => setIsOpen(true)}
          className={cn(
            'relative w-16 h-16 rounded-full',
            'bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500',
            'shadow-2xl border-2 border-white/20 dark:border-white/10',
            'flex items-center justify-center',
            'hover:scale-110 active:scale-95',
            'transition-all duration-200',
            'cursor-pointer'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open FocusAI Assistant"
        >
          {/* Mascot Avatar */}
          <div className="w-full h-full flex items-center justify-center overflow-visible">
            <FocusAIMascot size="sm" animated={true} />
          </div>

          {/* Notification Badge (optional - can be conditionally shown) */}
          {/* <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          /> */}
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <AssistantChat
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            userName={user?.name || 'there'}
          />
        )}
      </AnimatePresence>
    </>
  );
}

