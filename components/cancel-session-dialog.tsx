'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface CancelSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  mode: 'solo' | 'partner' | 'matchmaking';
  partnerName?: string;
}

export function CancelSessionDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  partnerName,
}: CancelSessionDialogProps) {
  const getTitle = () => {
    if (mode === 'matchmaking') {
      return 'Cancel matchmaking?';
    }
    return mode === 'partner' ? 'End session with partner?' : 'End focus session?';
  };

  const getDescription = () => {
    if (mode === 'matchmaking') {
      return 'You will be removed from the matchmaking queue and returned to the dashboard.';
    }
    
    if (mode === 'partner' && partnerName) {
      return `Are you sure you want to end this session? ${partnerName} will be notified that you left the session. Your progress will still be saved.`;
    }
    
    return 'Are you sure you want to end this focus session? Your progress and notes will be saved.';
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Continue Session</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {mode === 'matchmaking' ? 'Cancel Search' : 'End Session'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}








