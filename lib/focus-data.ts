// Predefined focus topics (will be extended with user-generated ones)
export const DEFAULT_FOCUS_TOPICS = [
  'Homework',
  'Reading',
  'Research',
  'Essay Writing',
  'Revision',
  'Programming',
  'Math Practice',
  'Lecture Notes',
  'Project Work',
  'Exam Prep',
  'Lab Report',
  'Problem Sets',
  'Book Review',
  'Case Study',
  'Literature Review',
  'Data Analysis',
  'Code Debugging',
  'Algorithm Practice',
  'Web Development',
  'Mobile Development',
  'Database Design',
  'System Design',
  'Portfolio Building',
  'Resume Writing',
  'Cover Letter',
  'Interview Prep',
  'Presentation Prep',
  'Group Project',
  'Thesis Writing',
  'Dissertation',
  'Language Learning',
  'Vocabulary Study',
  'Grammar Practice',
  'Speaking Practice',
  'Writing Practice',
  'Flashcards',
  'Mind Mapping',
  'Note Taking',
  'Summarizing',
  'Annotating',
  'Outline Creation',
  'Draft Writing',
  'Editing',
  'Proofreading',
  'Peer Review',
  'Course Review',
  'Concept Mapping',
  'Quiz Preparation',
  'Test Review',
  'Practice Exams',
];

// Predefined study goals
export const DEFAULT_STUDY_GOALS = [
  'Finish Assignment',
  'Complete Chapter',
  'Memorize Notes',
  'Solve Past Questions',
  'Clean Inbox',
  'Write Summary',
  'Organize Tasks',
  'Prepare Presentation',
  'Review Material',
  'Master Concept',
  'Complete Exercises',
  'Finish Reading',
  'Write Report',
  'Create Outline',
  'Solve Problems',
  'Practice Skills',
  'Study Topic',
  'Review Notes',
  'Complete Project',
  'Prepare for Exam',
  'Learn New Concept',
  'Practice Coding',
  'Debug Code',
  'Design Solution',
  'Research Topic',
];

// Local storage keys
const FOCUS_TOPICS_KEY = 'focusmate_focus_topics';
const STUDY_GOALS_KEY = 'focusmate_study_goals';

/**
 * Get all focus topics (defaults + custom)
 */
export function getFocusTopics(): string[] {
  if (typeof window === 'undefined') return DEFAULT_FOCUS_TOPICS;
  
  try {
    const custom = localStorage.getItem(FOCUS_TOPICS_KEY);
    const customTopics = custom ? JSON.parse(custom) : [];
    return Array.from(new Set([...DEFAULT_FOCUS_TOPICS, ...customTopics]));
  } catch {
    return DEFAULT_FOCUS_TOPICS;
  }
}

/**
 * Add a new custom focus topic
 */
export function addFocusTopic(topic: string): void {
  if (typeof window === 'undefined') return;
  
  const trimmed = topic.trim();
  if (!trimmed) return;
  
  try {
    const custom = localStorage.getItem(FOCUS_TOPICS_KEY);
    const customTopics = custom ? JSON.parse(custom) : [];
    
    if (!customTopics.includes(trimmed)) {
      customTopics.push(trimmed);
      localStorage.setItem(FOCUS_TOPICS_KEY, JSON.stringify(customTopics));
      
      // TODO: Also save to backend API when available
      // await saveFocusTopicToBackend(trimmed);
    }
  } catch (error) {
    console.error('Failed to save focus topic:', error);
  }
}

/**
 * Get all study goals (defaults + custom)
 */
export function getStudyGoals(): string[] {
  if (typeof window === 'undefined') return DEFAULT_STUDY_GOALS;
  
  try {
    const custom = localStorage.getItem(STUDY_GOALS_KEY);
    const customGoals = custom ? JSON.parse(custom) : [];
    return Array.from(new Set([...DEFAULT_STUDY_GOALS, ...customGoals]));
  } catch {
    return DEFAULT_STUDY_GOALS;
  }
}

/**
 * Add a new custom study goal
 */
export function addStudyGoal(goal: string): void {
  if (typeof window === 'undefined') return;
  
  const trimmed = goal.trim();
  if (!trimmed) return;
  
  try {
    const custom = localStorage.getItem(STUDY_GOALS_KEY);
    const customGoals = custom ? JSON.parse(custom) : [];
    
    if (!customGoals.includes(trimmed)) {
      customGoals.push(trimmed);
      localStorage.setItem(STUDY_GOALS_KEY, JSON.stringify(customGoals));
      
      // TODO: Also save to backend API when available
      // await saveStudyGoalToBackend(trimmed);
    }
  } catch (error) {
    console.error('Failed to save study goal:', error);
  }
}

/**
 * Remove a custom focus topic
 */
export function removeFocusTopic(topic: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const custom = localStorage.getItem(FOCUS_TOPICS_KEY);
    const customTopics = custom ? JSON.parse(custom) : [];
    const filtered = customTopics.filter((t: string) => t !== topic);
    localStorage.setItem(FOCUS_TOPICS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove focus topic:', error);
  }
}

/**
 * Remove a custom study goal
 */
export function removeStudyGoal(goal: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const custom = localStorage.getItem(STUDY_GOALS_KEY);
    const customGoals = custom ? JSON.parse(custom) : [];
    const filtered = customGoals.filter((g: string) => g !== goal);
    localStorage.setItem(STUDY_GOALS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove study goal:', error);
  }
}

