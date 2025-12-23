'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Target, Flag, Clock, CheckSquare, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getFocusTopics, addFocusTopic, getStudyGoals, addStudyGoal } from '@/lib/focus-data';
import { getTasks, type Task } from '@/lib/api/tasks';
import { cn } from '@/lib/utils';

interface FocusSetupFormProps {
  initialDuration?: number;
  onStart: (data: { focusTopic: string; studyGoal?: string; duration: number; taskId?: string }) => void;
}

export function FocusSetupForm({ initialDuration = 25, onStart }: FocusSetupFormProps) {
  const [focusTopic, setFocusTopic] = useState('');
  const [focusTopicInput, setFocusTopicInput] = useState('');
  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [filteredFocusTopics, setFilteredFocusTopics] = useState<string[]>([]);

  const [studyGoal, setStudyGoal] = useState('');
  const [studyGoalInput, setStudyGoalInput] = useState('');
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [filteredGoals, setFilteredGoals] = useState<string[]>([]);

  const [duration, setDuration] = useState<number | 'custom'>(initialDuration);
  const [customDuration, setCustomDuration] = useState(25);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  
  const focusInputRef = useRef<HTMLInputElement>(null);
  const goalInputRef = useRef<HTMLInputElement>(null);
  const focusDropdownRef = useRef<HTMLDivElement>(null);
  const goalDropdownRef = useRef<HTMLDivElement>(null);

  // Load focus topics
  useEffect(() => {
    const topics = getFocusTopics();
    setFilteredFocusTopics(topics);
  }, []);

  // Load available tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const allTasks = await getTasks();
        const pendingTasks = allTasks.filter(t => !t.completed);
        setAvailableTasks(pendingTasks.slice(0, 5)); // Show top 5 pending tasks
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setAvailableTasks([]);
      }
    };
    loadTasks();
  }, []);

  // Filter focus topics based on input
  useEffect(() => {
    const input = focusTopicInput.toLowerCase().trim();
    if (!input) {
      setFilteredFocusTopics(getFocusTopics());
      return;
    }

    const topics = getFocusTopics();
    const filtered = topics.filter((topic) =>
      topic.toLowerCase().includes(input)
    );
    setFilteredFocusTopics(filtered);
  }, [focusTopicInput]);

  // Load study goals
  useEffect(() => {
    const goals = getStudyGoals();
    setFilteredGoals(goals);
  }, []);

  // Filter study goals based on input
  useEffect(() => {
    const input = studyGoalInput.toLowerCase().trim();
    if (!input) {
      setFilteredGoals(getStudyGoals());
      return;
    }

    const goals = getStudyGoals();
    const filtered = goals.filter((goal) =>
      goal.toLowerCase().includes(input)
    );
    setFilteredGoals(filtered);
  }, [studyGoalInput]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        focusDropdownRef.current &&
        !focusDropdownRef.current.contains(event.target as Node) &&
        !focusInputRef.current?.contains(event.target as Node)
      ) {
        setShowFocusDropdown(false);
      }
      if (
        goalDropdownRef.current &&
        !goalDropdownRef.current.contains(event.target as Node) &&
        !goalInputRef.current?.contains(event.target as Node)
      ) {
        setShowGoalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocusTopicSelect = (topic: string) => {
    setFocusTopic(topic);
    setFocusTopicInput(topic);
    setShowFocusDropdown(false);
  };

  const handleFocusTopicChange = (value: string) => {
    setFocusTopicInput(value);
    setShowFocusDropdown(true);
    
    // If user typed something new that's not in the list, allow it
    if (value.trim()) {
      setFocusTopic(value.trim());
    }
  };

  const handleFocusTopicBlur = () => {
    // Save custom topic if it's new
    if (focusTopicInput.trim() && !getFocusTopics().includes(focusTopicInput.trim())) {
      addFocusTopic(focusTopicInput.trim());
    }
  };

  const handleGoalSelect = (goal: string) => {
    setStudyGoal(goal);
    setStudyGoalInput(goal);
    setShowGoalDropdown(false);
  };

  const handleGoalChange = (value: string) => {
    setStudyGoalInput(value);
    setShowGoalDropdown(true);
    
    // If user typed something new that's not in the list, allow it
    if (value.trim()) {
      setStudyGoal(value.trim());
    }
  };

  const handleGoalBlur = () => {
    // Save custom goal if it's new
    if (studyGoalInput.trim() && !getStudyGoals().includes(studyGoalInput.trim())) {
      addStudyGoal(studyGoalInput.trim());
    }
  };

  const handleStart = () => {
    if (!focusTopic.trim()) {
      return;
    }

    const finalDuration = duration === 'custom' ? customDuration : duration;
    onStart({
      focusTopic: focusTopic.trim(),
      studyGoal: studyGoal.trim() || undefined,
      duration: finalDuration,
      taskId: selectedTask?.id,
    });
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setFocusTopic(task.title);
    setShowTaskSelector(false);
  };

  const canStart = focusTopic.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Task Selector (Optional) */}
      {availableTasks.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Work on a Task (Optional)
          </Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTaskSelector(!showTaskSelector)}
              className={cn(
                'w-full rounded-xl border-2 p-3 text-left transition-all',
                selectedTask
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              )}
            >
              {selectedTask ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedTask.title}</p>
                    {selectedTask.dueDate && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {/* 🔧 FIX: Changed to div (cannot nest button in button) */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        setSelectedTask(null);
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">Select a task to work on...</p>
              )}
            </button>
            {showTaskSelector && availableTasks.length > 0 && (
              <div className="absolute z-50 mt-2 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                {availableTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => handleTaskSelect(task)}
                    className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                          {task.plannedStartTime && ` • ${task.plannedStartTime}`}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Focus Topic */}
      <div className="space-y-2">
        <Label htmlFor="focus-topic" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Target className="h-4 w-4" />
          What do you want to focus on? <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={focusInputRef}
              id="focus-topic"
              type="text"
              placeholder="Type or select a focus topic..."
              value={focusTopicInput}
              onChange={(e) => handleFocusTopicChange(e.target.value)}
              onFocus={() => setShowFocusDropdown(true)}
              onBlur={handleFocusTopicBlur}
              className="pl-10 rounded-xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 focus:border-indigo-500 transition-colors"
            />
          </div>
          {showFocusDropdown && filteredFocusTopics.length > 0 && (
            <div
              ref={focusDropdownRef}
              className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              {filteredFocusTopics.slice(0, 10).map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleFocusTopicSelect(topic)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {topic}
                </button>
              ))}
              {filteredFocusTopics.length > 10 && (
                <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
                  +{filteredFocusTopics.length - 10} more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Study Goal */}
      <div className="space-y-2">
        <Label htmlFor="study-goal" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Flag className="h-4 w-4" />
          Do you have a study goal? <span className="text-slate-400">(Optional)</span>
        </Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              ref={goalInputRef}
              id="study-goal"
              type="text"
              placeholder="Type or select a goal..."
              value={studyGoalInput}
              onChange={(e) => handleGoalChange(e.target.value)}
              onFocus={() => setShowGoalDropdown(true)}
              onBlur={handleGoalBlur}
              className="pl-10 rounded-xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 focus:border-indigo-500 transition-colors"
            />
          </div>
          {showGoalDropdown && filteredGoals.length > 0 && (
            <div
              ref={goalDropdownRef}
              className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              {filteredGoals.slice(0, 10).map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalSelect(goal)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {goal}
                </button>
              ))}
              {filteredGoals.length > 10 && (
                <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
                  +{filteredGoals.length - 10} more...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Duration Selector */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Session Duration
        </Label>
        <div className="flex gap-3">
          {[25, 50].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setDuration(mins)}
              className={cn(
                'flex-1 rounded-2xl border-2 p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-md',
                duration === mins
                  ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400'
              )}
            >
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {mins}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                minutes
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDuration('custom')}
            className={cn(
              'flex-1 rounded-2xl border-2 p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-md',
              duration === 'custom'
                ? 'border-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 shadow-lg'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400'
            )}
          >
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Custom
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              minutes
            </div>
          </button>
        </div>
        {duration === 'custom' && (
          <div className="mt-3">
            <Input
              type="number"
              min="1"
              max="180"
              placeholder="Enter minutes (1-180)"
              value={customDuration}
              onChange={(e) => setCustomDuration(parseInt(e.target.value) || 25)}
              className="rounded-xl border-2 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 focus:border-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 py-6 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Start Session
      </Button>
    </div>
  );
}





