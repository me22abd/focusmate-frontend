/**
 * ============================================================================
 * TASKS.TS - TASK MANAGEMENT API CLIENT
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom API client for task CRUD operations.
 * Pattern: Axios-based API client (similar to auth.ts, sessions.ts).
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

import axiosInstance from '../axios';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  plannedStartTime?: string;
  plannedEndTime?: string;
  status: 'pending' | 'completed' | 'overdue' | null;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  moduleId?: string;
  reminderFrequency?: string;
  sessions?: any[];
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  autoCompletedToday?: number;
  completionRate?: number;
}

// Create task
export const createTask = async (data: Partial<Task>): Promise<Task> => {
  const response = await axiosInstance.post('/tasks', data);
  return response.data;
};

// Get all tasks
export const getTasks = async (): Promise<Task[]> => {
  const response = await axiosInstance.get('/tasks');
  return response.data;
};

// Get task stats
export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await axiosInstance.get('/tasks/stats');
  return response.data;
};

// Get single task
export const getTask = async (id: string): Promise<Task> => {
  const response = await axiosInstance.get(`/tasks/${id}`);
  return response.data;
};

// Update task
export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const response = await axiosInstance.patch(`/tasks/${id}`, data);
  return response.data;
};

// Update task progress
export const updateTaskProgress = async (id: string, progress: number): Promise<Task> => {
  const response = await axiosInstance.patch(`/tasks/${id}/progress`, { progress });
  return response.data;
};

// Toggle task complete
export const toggleTaskComplete = async (id: string): Promise<Task> => {
  const response = await axiosInstance.patch(`/tasks/${id}/toggle`);
  return response.data;
};

// Delete task
export const deleteTask = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/tasks/${id}`);
};


