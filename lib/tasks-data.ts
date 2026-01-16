// Local storage-based tasks management
// TODO: Replace with backend API when tasks feature is implemented

export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category: string;
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  scheduledTime?: string; // HH:mm format (optional)
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

const TASKS_STORAGE_KEY = 'focusmate_tasks';

// Common task categories (100+ options)
export const TASK_CATEGORIES = [
  // Work
  'Work', 'Office', 'Meeting', 'Presentation', 'Report', 'Email', 'Project', 'Deadline',
  'Client', 'Team', 'Conference', 'Interview', 'Review', 'Planning', 'Strategy',
  
  // Personal
  'Personal', 'Home', 'Family', 'Shopping', 'Errands', 'Appointment', 'Call', 'Message',
  'Finance', 'Bills', 'Insurance', 'Tax', 'Legal', 'Document', 'Paperwork',
  
  // Health & Fitness
  'Health', 'Fitness', 'Workout', 'Exercise', 'Gym', 'Yoga', 'Meditation', 'Doctor',
  'Dentist', 'Therapy', 'Checkup', 'Medicine', 'Diet', 'Nutrition', 'Wellness',
  
  // Education
  'School', 'Study', 'Homework', 'Assignment', 'Exam', 'Test', 'Research', 'Reading',
  'Learning', 'Course', 'Lecture', 'Tutorial', 'Practice', 'Review Notes', 'Essay',
  
  // Social
  'Social', 'Friends', 'Party', 'Event', 'Dinner', 'Lunch', 'Coffee', 'Date',
  'Birthday', 'Anniversary', 'Celebration', 'Gathering', 'Networking',
  
  // Hobbies & Interests
  'Hobby', 'Creative', 'Art', 'Music', 'Writing', 'Photography', 'Cooking', 'Gardening',
  'Reading', 'Gaming', 'Sports', 'Travel', 'Entertainment', 'Movie', 'Book',
  
  // Technology
  'Tech', 'Coding', 'Development', 'Design', 'Maintenance', 'Update', 'Backup', 'Setup',
  'Installation', 'Configuration', 'Testing', 'Debugging', 'Deployment',
  
  // Household
  'Household', 'Cleaning', 'Laundry', 'Repair', 'Maintenance', 'Organization', 'Declutter',
  'Furniture', 'Decoration', 'Renovation', 'Utilities', 'Maintenance',
  
  // Transportation
  'Transport', 'Travel', 'Flight', 'Train', 'Bus', 'Car', 'Parking', 'License',
  'Registration', 'Insurance', 'Service', 'Repair',
  
  // Other
  'Other', 'Urgent', 'Important', 'Follow-up', 'Reminder', 'Note', 'Idea', 'Goal',
];

// AI-powered category suggestions based on task title
export const suggestCategory = (title: string): string[] => {
  const lowerTitle = title.toLowerCase();
  const suggestions: string[] = [];
  
  // Work-related
  if (lowerTitle.match(/\b(meeting|standup|conference|presentation|report|deadline|client|project)\b/)) {
    suggestions.push('Work', 'Office', 'Meeting');
  }
  
  // Health-related
  if (lowerTitle.match(/\b(doctor|dentist|appointment|checkup|workout|gym|exercise|meditation)\b/)) {
    suggestions.push('Health', 'Fitness', 'Appointment');
  }
  
  // Education-related
  if (lowerTitle.match(/\b(study|homework|assignment|exam|test|reading|research|lecture)\b/)) {
    suggestions.push('School', 'Study', 'Learning');
  }
  
  // Personal/Home
  if (lowerTitle.match(/\b(shopping|grocery|cleaning|laundry|repair|call|appointment)\b/)) {
    suggestions.push('Personal', 'Home', 'Errands');
  }
  
  // If no matches, return common categories
  if (suggestions.length === 0) {
    suggestions.push('Personal', 'Work', 'Other');
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
};

export const getTasks = (): Task[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
  
  return [];
};

export const saveTask = (task: Omit<Task, 'id' | 'createdAt' | 'status'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  
  tasks.push(newTask);
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  tasks[index] = { 
    ...tasks[index], 
    ...updates,
    ...(updates.status === 'completed' && !tasks[index].completedAt 
      ? { completedAt: new Date().toISOString() }
      : {}),
  };
  
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  return tasks[index];
};

export const deleteTask = (id: string): boolean => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  
  if (filtered.length === tasks.length) return false;
  
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const toggleTaskComplete = (id: string): Task | null => {
  const task = getTasks().find(t => t.id === id);
  if (!task) return null;
  
  const newStatus: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
  return updateTask(id, { 
    status: newStatus,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
  });
};

// Filter tasks by status and date
export const getTasksByFilter = (
  filter: 'today' | 'pending' | 'completed',
  tasks: Task[] = getTasks()
): Task[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  switch (filter) {
    case 'today':
      return tasks.filter(task => {
        if (task.status === 'completed') return false;
        return task.scheduledDate === todayStr;
      });
    
    case 'pending':
      return tasks.filter(task => {
        if (task.status === 'completed') return false;
        const taskDate = new Date(task.scheduledDate);
        return taskDate >= today;
      });
    
    case 'completed':
      return tasks.filter(task => task.status === 'completed');
    
    default:
      return tasks;
  }
};

// Get task statistics
export const getTaskStats = () => {
  const tasks = getTasks();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const completed = tasks.filter(t => t.status === 'completed').length;
  const remaining = tasks.filter(t => t.status === 'pending' && new Date(t.scheduledDate) >= today).length;
  const scheduled = tasks.filter(t => t.status === 'pending').length;
  const todayTasks = tasks.filter(t => t.status === 'pending' && t.scheduledDate === todayStr).length;
  
  return {
    completed,
    remaining,
    scheduled,
    today: todayTasks,
    total: tasks.length,
  };
};


















