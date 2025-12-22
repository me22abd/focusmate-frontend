/**
 * Gamification API Client
 * Handles XP, levels, coins, and gamification stats
 */

import axiosInstance from '../axios';

export interface GamificationStats {
  xp: number;
  level: number;
  nextLevelXp: number;
  coins: number;
}

/**
 * Get user's gamification stats
 */
export const getGamificationStats = async (): Promise<GamificationStats> => {
  try {
    const response = await axiosInstance.get('/gamification/stats');
    return response.data || { xp: 0, level: 1, nextLevelXp: 500, coins: 0 };
  } catch (error) {
    console.error('Failed to fetch gamification stats:', error);
    return { xp: 0, level: 1, nextLevelXp: 500, coins: 0 };
  }
};



