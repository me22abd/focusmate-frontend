// Local storage-based habits management
// TODO: Replace with backend API when habits feature is implemented

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedToday: boolean;
  completedThisWeek: number[];
  createdAt: string;
  color?: string;
}

const HABITS_STORAGE_KEY = 'focusmate_habits';

export const getHabits = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(HABITS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load habits:', error);
  }
  
  return [];
};

export const saveHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'streak' | 'completedToday' | 'completedThisWeek'>): Habit => {
  const habits = getHabits();
  const newHabit: Habit = {
    ...habit,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    streak: 0,
    completedToday: false,
    completedThisWeek: [],
  };
  
  habits.push(newHabit);
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  return newHabit;
};

export const updateHabit = (id: string, updates: Partial<Habit>): Habit | null => {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === id);
  
  if (index === -1) return null;
  
  habits[index] = { ...habits[index], ...updates };
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  return habits[index];
};

export const deleteHabit = (id: string): boolean => {
  const habits = getHabits();
  const filtered = habits.filter(h => h.id !== id);
  
  if (filtered.length === habits.length) return false;
  
  localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const toggleHabitComplete = (id: string): Habit | null => {
  const habits = getHabits();
  const habit = habits.find(h => h.id === id);
  
  if (!habit) return null;
  
  const today = new Date();
  const todayStr = today.toDateString();
  const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Check if already completed today
  const lastCompleted = habit.completedThisWeek?.find(
    (d: any) => new Date(d).toDateString() === todayStr
  );
  
  if (lastCompleted) {
    // Already completed today, do nothing or uncomplete
    return habit;
  }
  
  // Mark as completed
  const completedDates = habit.completedThisWeek || [];
  completedDates.push(today.toISOString());
  
  // Calculate streak
  let newStreak = habit.streak;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  const completedYesterday = completedDates.find(
    (d: any) => new Date(d).toDateString() === yesterdayStr
  );
  
  if (completedYesterday || habit.streak === 0) {
    newStreak = habit.streak + 1;
  } else {
    newStreak = 1; // Reset streak
  }
  
  return updateHabit(id, {
    completedToday: true,
    completedThisWeek: completedDates,
    streak: newStreak,
  });
};

// Reset completedToday flag daily
export const resetDailyHabits = () => {
  const habits = getHabits();
  const today = new Date().toDateString();
  
  habits.forEach(habit => {
    const lastCompleted = habit.completedThisWeek?.find(
      (d: any) => new Date(d).toDateString() === today
    );
    
    updateHabit(habit.id, {
      completedToday: !!lastCompleted,
    });
  });
};









