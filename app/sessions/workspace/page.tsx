 /**
 * ============================================================================
 * SESSIONS/WORKSPACE/PAGE.TSX - SESSIONS WORKSPACE (CENTRAL HUB)
 * ============================================================================
 * 
 * Purpose: Transform Sessions into the central workspace containing all
 * productivity features: Tasks, Modules, Notes, Flashcards, Reminders,
 * Study Plan, and Live Analytics. All in one unified interface.
 * 
 * 📘 CODE ORIGIN: Custom workspace implementation with panel navigation.
 * Framework: Next.js App Router, React hooks. Custom: Multi-panel workspace.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/navbar';
import { QuickNav } from '@/components/quick-nav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckSquare,
  BookOpen,
  FileText,
  Brain,
  Bell,
  Calendar,
  Menu,
  X,
  UsersRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TasksPanel } from '@/components/sessions/tasks-panel';
import { ModulesPanel } from '@/components/sessions/modules-panel';
import { NotesPanel } from '@/components/sessions/notes-panel';
import { FlashcardsPanel } from '@/components/sessions/flashcards-panel';
import { RemindersPanel } from '@/components/sessions/reminders-panel';
import { StudyPlanPanel } from '@/components/sessions/studyplan-panel';
import { MatchmakingPanel } from '@/components/sessions/matchmaking-panel';

type PanelType = 'tasks' | 'modules' | 'notes' | 'flashcards' | 'reminders' | 'studyplan' | 'matchmaking';

interface Panel {
  id: PanelType;
  name: string;
  icon: typeof CheckSquare;
  color: string;
}

const panels: Panel[] = [
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: 'bg-blue-500' },
  { id: 'modules', name: 'Modules', icon: BookOpen, color: 'bg-purple-500' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-green-500' },
  { id: 'flashcards', icon: Brain, name: 'Flashcards', color: 'bg-orange-500' },
  { id: 'reminders', name: 'Reminders', icon: Bell, color: 'bg-red-500' },
  { id: 'studyplan', name: 'Study Plan', icon: Calendar, color: 'bg-indigo-500' },
  { id: 'matchmaking', name: 'Matchmaking', icon: UsersRound, color: 'bg-sky-500' },
];

export default function SessionsWorkspacePage() {
  useAuthGuard();
  const router = useRouter();
  const { user } = useAuthStore();
  const [activePanel, setActivePanel] = useState<PanelType>('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePanelData = panels.find(p => p.id === activePanel);

  return (
    <>
      <Navbar />
      <QuickNav showBack={true} showHome={true} />
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Sessions Workspace
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your productivity hub
              </p>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {panels.map((panel) => {
                const Icon = panel.icon;
                const isActive = activePanel === panel.id;
                
                return (
                  <motion.button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={cn('h-5 w-5', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                    <span className="font-medium">{panel.name}</span>
                  </motion.button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                Sessions Workspace
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="fixed left-0 top-16 bottom-0 w-70 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:hidden overflow-y-auto"
                >
                  <nav className="p-4 space-y-2">
                    {panels.map((panel) => {
                      const Icon = panel.icon;
                      const isActive = activePanel === panel.id;
                      
                      return (
                        <button
                          key={panel.id}
                          onClick={() => {
                            setActivePanel(panel.id);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                            isActive
                              ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          )}
                        >
                          <Icon className={cn('h-5 w-5', isActive && 'text-indigo-600 dark:text-indigo-400')} />
                          <span className="font-medium">{panel.name}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {/* Panel Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
              <div className="flex items-center gap-3">
                {activePanelData && (
                  <>
                    <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', activePanelData.color)}>
                      <activePanelData.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {activePanelData.name}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activePanelData.id === 'tasks' && 'Automated task management'}
                      {activePanelData.id === 'modules' && 'Course and module organization'}
                      {activePanelData.id === 'notes' && 'Session notes and study materials'}
                      {activePanelData.id === 'flashcards' && 'Flashcard review and spaced repetition'}
                      {activePanelData.id === 'reminders' && 'Smart reminders and notifications'}
                      {activePanelData.id === 'studyplan' && '7-day auto-generated study plan'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-4 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePanel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activePanel === 'tasks' && <TasksPanel />}
                  {activePanel === 'modules' && <ModulesPanel />}
                  {activePanel === 'notes' && <NotesPanel />}
                  {activePanel === 'flashcards' && <FlashcardsPanel />}
                  {activePanel === 'reminders' && <RemindersPanel />}
                  {activePanel === 'studyplan' && <StudyPlanPanel />}
                  {activePanel === 'matchmaking' && <MatchmakingPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

