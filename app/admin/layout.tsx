'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  X,
  Mail
} from 'lucide-react';
import { adminLogout } from '@/lib/api/admin';
import { Toaster } from 'sonner';
import { AnimatedButton } from '@/components/ui/animated-button';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/admin/sessions', label: 'Sessions', icon: Calendar },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/achievements', label: 'Achievements', icon: Award },
  { href: '/admin/ai-email-helper', label: 'AI Email Helper', icon: Mail },
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      {/* Floating gradient orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Premium Glass Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-[240px] backdrop-blur-xl bg-white/40 dark:bg-white/5 border-r border-white/20 dark:border-white/10 flex-shrink-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Header with gradient */}
          <div className="flex h-16 items-center justify-between border-b border-white/20 dark:border-white/10 px-6 flex-shrink-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 rounded-md hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-4">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-700 hover:bg-white/20 dark:text-slate-300 dark:hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Logout - Fixed at bottom */}
          <div className="border-t border-white/20 dark:border-white/10 p-4 flex-shrink-0">
            <AnimatedButton
              onClick={handleLogout}
              variant="ghost"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50/50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </AnimatedButton>
          </div>
        </div>
      </aside>

      {/* Main Content - Responsive padding: no padding on mobile, 240px on desktop */}
      <main className="relative z-10 min-h-screen md:pl-[240px]">
        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 left-4 z-30">
          <AnimatedButton
            onClick={() => setSidebarOpen(true)}
            variant="outline"
            className="p-2 rounded-md bg-white/40 dark:bg-white/5 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-lg"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </AnimatedButton>
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










