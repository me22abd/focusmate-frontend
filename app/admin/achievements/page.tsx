'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllAchievements, type Achievement } from '@/lib/api/admin';

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const data = await getAllAchievements();
        setAchievements(data);
      } catch (error: any) {
        console.error('Failed to load achievements:', error);
        // Silently handle errors - show empty state
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading achievements...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Achievements Panel</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          View and manage user achievements
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Achievements ({achievements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.length === 0 ? (
              <p className="text-center text-muted-foreground col-span-full py-8">
                No achievements found
              </p>
            ) : (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon || '🏆'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700">
                          {achievement.type}
                        </span>
                        {achievement.earnedAt && (
                          <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                            ✓ Earned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Achievement management functionality would be implemented here:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Edit achievement title and description</li>
            <li>Assign achievements to specific users</li>
            <li>View achievement statistics</li>
            <li>Create new achievements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}



