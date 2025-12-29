'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  Award, 
  Settings,
  LogOut,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { adminLogout } from '@/lib/api/admin';
import { Toaster } from 'sonner';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/achievements', label: 'Achievements', icon: Award },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // adminLogout() already handles redirect, but ensure we use hard redirect
    adminLogout();
    // Don't use router.push - adminLogout uses window.location.href for hard redirect
  };

  // If on login, register, or landing page, return children without sidebar/layout
  if (pathname === '/admin/login' || pathname === '/admin/register' || pathname === '/admin') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed at 240px width */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 flex-shrink-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Admin Panel
            </h1>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout - Fixed at bottom */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Responsive padding: no padding on mobile, 240px on desktop */}
      <main className="min-h-screen md:pl-[240px]">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}










