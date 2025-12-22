'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SessionModeSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSolo: (duration: number) => void;
  onStartMatching: (duration: number) => void;
}

export function SessionModeSelect({
  isOpen,
  onClose,
  onStartSolo,
  onStartMatching,
}: SessionModeSelectProps) {
  const [sessionLength, setSessionLength] = useState<25 | 50>(25);
  const [selectedMode, setSelectedMode] = useState<'solo' | 'partner' | null>(null);

  const handleModeSelect = (mode: 'solo' | 'partner') => {
    setSelectedMode(mode);
  };

  const handleConfirm = () => {
    if (selectedMode === 'solo') {
      onStartSolo(sessionLength);
    } else if (selectedMode === 'partner') {
      onStartMatching(sessionLength);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative z-50 w-full max-w-2xl"
        >
          <Card className="border-2 shadow-2xl">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                    Start Focus Session
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Choose your session mode and duration
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Session Length Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  Session Length
                </label>
                <div className="flex gap-3">
                  {[25, 50].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setSessionLength(duration as 25 | 50)}
                      className={cn(
                        'flex-1 rounded-2xl border-2 p-4 text-center transition-all duration-200',
                        'hover:scale-105 hover:shadow-md',
                        sessionLength === duration
                          ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg'
                          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400'
                      )}
                    >
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {duration}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        minutes
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Mode Selector */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Session Mode
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Work Alone Option */}
                  <button
                    onClick={() => handleModeSelect('solo')}
                    className={cn(
                      'group relative rounded-3xl border-2 p-6 text-left transition-all duration-200',
                      'hover:scale-[1.02] hover:shadow-xl',
                      selectedMode === 'solo'
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200',
                          selectedMode === 'solo'
                            ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        )}
                      >
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Work Alone
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Solo mode, no matching. Just you and your focus.
                        </p>
                      </div>
                    </div>
                    {selectedMode === 'solo' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        ✓ You'll work solo. Stay focused!
                      </motion.div>
                    )}
                  </button>

                  {/* Find a Partner Option */}
                  <button
                    onClick={() => handleModeSelect('partner')}
                    className={cn(
                      'group relative rounded-3xl border-2 p-6 text-left transition-all duration-200',
                      'hover:scale-[1.02] hover:shadow-xl',
                      selectedMode === 'partner'
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200',
                          selectedMode === 'partner'
                            ? 'bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                        )}
                      >
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Find a Partner
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Match with an accountability partner for real-time focus.
                        </p>
                      </div>
                    </div>
                    {selectedMode === 'partner' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-xs font-medium text-indigo-600 dark:text-indigo-400"
                      >
                        ✓ We'll find you a partner to focus with
                      </motion.div>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedMode}
                  className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 text-white hover:opacity-90 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Start Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
