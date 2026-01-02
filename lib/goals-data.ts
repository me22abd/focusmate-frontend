// Local storage-based goals management
// TODO: Replace with backend API when goals feature is implemented

export interface Goal {
  id: string;
  name: string;
  description?: string;
  category: string;
  currentMilestone?: string;
  targetDate?: string;
  progress: number; // 0-100
  status: 'on-track' | 'behind' | 'completed';
  createdAt: string;
  color?: string;
}

const GOALS_STORAGE_KEY = 'focusmate_goals';

export const getGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load goals:', error);
  }
  
  return [];
};

export const saveGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'status'>): Goal => {
  const goals = getGoals();
  const newGoal: Goal = {
    ...goal,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    progress: 0,
    status: 'on-track',
  };
  
  goals.push(newGoal);
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  return newGoal;
};

export const updateGoal = (id: string, updates: Partial<Goal>): Goal | null => {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  goals[index] = { ...goals[index], ...updates };
  
  // Auto-update status based on progress
  if (updates.progress !== undefined) {
    if (updates.progress >= 100) {
      goals[index].status = 'completed';
    } else if (updates.progress < 50) {
      goals[index].status = 'behind';
    } else {
      goals[index].status = 'on-track';
    }
  }
  
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  return goals[index];
};

export const deleteGoal = (id: string): boolean => {
  const goals = getGoals();
  const filtered = goals.filter(g => g.id !== id);
  
  if (filtered.length === goals.length) return false;
  
  localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

















