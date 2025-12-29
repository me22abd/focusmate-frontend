'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '@/lib/api/auth';
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { motion } from 'framer-motion';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!', {
        description: 'Please check your email for the reset code.',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
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
                    Forgot Password
                  </span>
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your email address and we'll send you a code to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailSent ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      We've sent a password reset code to your email. Please check your inbox.
                    </p>
                    <AnimatedButton
                      onClick={() => router.push('/reset-password')}
                      className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enter Reset Code
                    </AnimatedButton>
                    <AnimatedButton
                      variant="outline"
                      onClick={() => setEmailSent(false)}
                      className="w-full"
                    >
                      Send Another Code
                    </AnimatedButton>
                  </div>
                ) : (
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

                    <AnimatedButton type="submit" className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reset Code
                        </>
                      )}
                    </AnimatedButton>
                  </form>
                )}

                <div className="mt-4 text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
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












