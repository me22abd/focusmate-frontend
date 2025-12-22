'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export default function AdminLandingPage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // CRITICAL: Only check admin_token, NOT user session
    // admin_token is httpOnly, so JavaScript can't read it
    // Make an API call to check if admin_token is valid
    const checkAuth = async () => {
      try {
        // Try to fetch dashboard stats - if it works, admin_token is valid
        const { getDashboardStats } = await import('@/lib/api/admin');
        await getDashboardStats();
        setHasToken(true);
      } catch (error: any) {
        // Not authenticated - admin_token is missing or invalid
        // Do NOT redirect here - component will handle navigation
        setHasToken(false);
      }
    };
    checkAuth();
  }, []);

  const handleContinue = () => {
    if (hasToken) {
      router.push('/admin/dashboard');
    } else {
      router.push('/admin/login');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
          <CardDescription className="text-base">
            Welcome to the Focusmate Admin Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Manage users, sessions, analytics, and system settings.</p>
            <p className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Secure admin access required
            </p>
          </div>
          <Button 
            onClick={handleContinue}
            className="w-full h-12 text-base"
            size="lg"
          >
            {hasToken ? 'Continue to Dashboard' : 'Continue to Admin Login'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}



