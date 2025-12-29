'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '@/lib/api/auth';
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailFromQuery = searchParams.get('email') || '';

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  // Update email if it comes from query params
  if (emailFromQuery) {
    setValue('email', emailFromQuery);
  }

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    
    try {
      await resetPassword(data.email, data.otp, data.newPassword);
      toast.success('Password reset successful!', {
        description: 'You can now log in with your new password.',
      });
      router.push('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Premium Animated Background */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
        {/* Floating gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
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

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
          <GlassCard delay={0.1} className="w-full max-w-md mx-auto">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="space-y-3">
                <div className="flex justify-center">
                  <Image 
                    src="/logo.svg"
                    alt="Focusmate Logo" 
                    width={60} 
                    height={60}
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                    Reset Password
                  </span>
                </CardTitle>
                <CardDescription className="text-center">
                  Enter the code sent to your email and your new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                />
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormField>

              <FormField>
                <FormLabel>Reset Code</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  {...register('otp')}
                />
                {errors.otp && (
                  <FormMessage>{errors.otp.message}</FormMessage>
                )}
              </FormField>

              <FormField>
                <FormLabel>New Password</FormLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    {...register('newPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <FormMessage>{errors.newPassword.message}</FormMessage>
                )}
              </FormField>

              <FormField>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    {...register('confirmPassword')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <FormMessage>{errors.confirmPassword.message}</FormMessage>
                )}
              </FormField>

                  <AnimatedButton type="submit" className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Reset Password
                      </>
                    )}
                  </AnimatedButton>
                </form>

                <div className="mt-4 text-center text-sm space-y-2">
                  <div>
                    <Link href="/forgot-password" className="text-primary hover:underline">
                      Request New Code
                    </Link>
                  </div>
                  <div>
                    <Link href="/login" className="text-primary hover:underline">
                      Back to Login
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </GlassCard>
        </div>
      </div>

      <SimpleFooter variant="public" />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <GlassCard delay={0} className="w-full max-w-md">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </CardContent>
            </Card>
          </GlassCard>
        </main>
        <SimpleFooter variant="public" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}








