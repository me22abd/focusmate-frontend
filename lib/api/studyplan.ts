/**
 * ============================================================================
 * STUDYPLAN.TS - STUDY PLAN API CLIENT
 * ============================================================================
 * 
 * 📘 CODE ORIGIN: Custom API client for study plan generation.
 * Pattern: Axios-based API client.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

import axiosInstance from '../axios';

export interface StudyPlanDay {
  id: string;
  date: string;
  tasks: string[]; // Array of task IDs
}

export interface StudyPlan {
  planId: string;
  days: StudyPlanDay[];
}

// Generate 7-day study plan
export const generateStudyPlan = async (): Promise<StudyPlan> => {
  const response = await axiosInstance.post('/studyplan/generate');
  return response.data;
};

// Get current study plan
export const getStudyPlan = async (): Promise<StudyPlan | null> => {
  try {
    const response = await axiosInstance.get('/studyplan/current');
    return response.data || null;
  } catch (error: any) {
    // If 404 or no plan exists, return null instead of throwing
    if (error.response?.status === 404 || error.response?.status === 400) {
      return null;
    }
    throw error;
  }
};

// Update study plan day
export const updateStudyPlanDay = async (date: string, data: { tasks: string[] }): Promise<StudyPlanDay> => {
  const response = await axiosInstance.patch(`/studyplan/days/${date}`, data);
  return response.data;
};

