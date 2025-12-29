'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface QuickPrompt {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const quickPrompts: QuickPrompt[] = [
  {
    label: 'Create Study Plan',
    prompt: 'Help me create a focus plan for this week',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    label: 'Analyze Progress',
    prompt: 'Analyze my progress and give me feedback',
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: 'Improve Streak',
    prompt: 'How can I improve my focus streak?',
    icon: <Target className="h-4 w-4" />,
  },
  {
    label: 'New Habits',
    prompt: 'Suggest new habits I should build',
    icon: <Lightbulb className="h-4 w-4" />,
  },
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPrompts({ onSelect, disabled = false }: QuickPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {quickPrompts.map((item, index) => (
        <motion.button
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !disabled && onSelect(item.prompt)}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {item.icon}
          <span>{item.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
















