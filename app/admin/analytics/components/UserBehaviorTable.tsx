'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllUsers, type User } from '@/lib/api/admin';
import useSWR from 'swr';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const fetcher = async () => {
  try {
    const users = await getAllUsers();
    return users || [];
  } catch (error: any) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

interface UserBehaviorRow extends User {
  sessionsCompleted?: number;
  avgDuration?: number;
  notesCreated?: number;
}

const ITEMS_PER_PAGE = 10;

export function UserBehaviorTable() {
  const { data: users, error, isLoading } = useSWR<User[]>(
    'admin-all-users',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    }
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Enhance users with mock behavior data (in production, this would come from backend)
  const enhancedUsers = useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      ...user,
      sessionsCompleted: Math.floor(Math.random() * 50) + 5,
      avgDuration: Math.floor(Math.random() * 30) + 15,
      notesCreated: Math.floor(Math.random() * 20),
    })) as UserBehaviorRow[];
  }, [users]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return enhancedUsers;
    const query = searchQuery.toLowerCase();
    return enhancedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [enhancedUsers, searchQuery]);

  // Paginate users
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const getStatusBadge = (user: UserBehaviorRow) => {
    if (user.suspended) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Suspended
        </span>
      );
    }
    if (user.lastLoginAt) {
      const daysSinceLogin = Math.floor(
        (new Date().getTime() - new Date(user.lastLoginAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLogin <= 7) {
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        );
      }
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
        Inactive
      </span>
    );
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Users className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                User Behavior Summary
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Overview of user activity and engagement
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse text-slate-500 dark:text-slate-400">
              Loading user data...
            </div>
          </div>
        ) : error ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-red-600 dark:text-red-400">
              Failed to load user data
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              No users found
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Avg. Duration
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {user.lastLoginAt
                            ? formatDistanceToNow(new Date(user.lastLoginAt), {
                                addSuffix: true,
                              })
                            : 'Never'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.sessionsCompleted || 0}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.avgDuration || 0} min
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.notesCreated || 0}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(user)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of{' '}
                  {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      'p-2 rounded-lg border border-slate-200 dark:border-slate-700',
                      'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-400 px-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      'p-2 rounded-lg border border-slate-200 dark:border-slate-700',
                      'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}










