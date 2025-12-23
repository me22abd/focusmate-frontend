'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  verifyEmailCode, 
  sendVerificationEmailCode
} from '@/lib/api/auth';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CheckCircle2, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const codeSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type CodeInput = z.infer<typeof codeSchema>;

export default function VerifyEmailCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, user: currentUser, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [canResendIn, setCanResendIn] = useState(0);
  const [resending, setResending] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CodeInput>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      email: email,
      code: '',
    },
  });

  const codeValue = watch('code');

  // Auto-focus code input
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (codeValue && codeValue.length === 6 && !isLoading && verificationStatus === 'idle') {
      handleSubmit(onSubmit)();
    }
  }, [codeValue]);

  const onSubmit = async (data: CodeInput) => {
    setIsLoading(true);
    setVerificationStatus('idle');

    try {
      // Verify the code and get updated user
      const response = await verifyEmailCode(data.email, data.code);
      setVerificationStatus('success');
      
      // CRITICAL: Refresh user state immediately after verification
      // If user is already logged in, update their session state
      if (currentUser) {
        try {
          // Fetch fresh user data from /auth/me to get latest verification status
          const freshUserResponse = await axiosInstance.get('/auth/me');
          const freshUser = freshUserResponse.data;
          if (freshUser.user) {
            // Update auth store with verified user
            updateUser(freshUser.user);
            toast.success('Email verified successfully!', {
              description: 'Your profile has been updated.',
            });
            // Redirect to dashboard if already logged in
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          } else {
            // Fallback: use user from verification response if available
            if (response.user) {
              updateUser(response.user);
            }
            toast.success('Email verified successfully!', {
              description: 'Redirecting to dashboard...',
            });
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          }
        } catch (refreshError) {
          // If refresh fails, still show success but redirect to login
          console.warn('Could not refresh user state:', refreshError);
          if (response.user) {
            updateUser(response.user);
          }
          toast.success('Email verified successfully!', {
            description: 'Please log in again to see the changes.',
          });
          setTimeout(() => {
            router.push(`/login?email=${encodeURIComponent(data.email)}&verified=true`);
          }, 2000);
        }
      } else {
        // User not logged in - redirect to login
        toast.success('Email verified successfully!', {
          description: 'Redirecting to login...',
        });
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(data.email)}&verified=true`);
        }, 2000);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      toast.error('Verification failed', {
        description: errorMessage,
      });
      // Clear code input on error
      setValue('code', '');
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (canResendIn > 0 || resending) {
      if (canResendIn > 0) {
        toast.info(`Please wait ${canResendIn} seconds before resending`);
      }
      return;
    }
    
    if (!email) {
      toast.error('Email address is required');
      return;
    }
    
    setResending(true);
    try {
      console.log('🔄 Resending verification code to:', email);
      const response = await sendVerificationEmailCode(email);
      
      console.log('✅ Resend response:', response);
      
      // Start cooldown timer
      if (response.canResendIn) {
        setCanResendIn(response.canResendIn);
        const interval = setInterval(() => {
          setCanResendIn((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      toast.success('Verification code sent!', {
        description: response.message || 'Please check your inbox',
      });
      
      // Clear current code input
      setValue('code', '');
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
      
      // In development, show code if returned
      if (response.code || response.devMode) {
        console.log('🔑 Development mode - Code:', response.code);
        if (response.code) {
          toast.info(`Dev mode: Code is ${response.code}`, {
            description: 'Check backend logs if email failed',
            duration: 10000,
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Resend error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend code';
      
      // Show more detailed error
      toast.error('Failed to resend code', {
        description: errorMessage,
        action: {
          label: 'Check Console',
          onClick: () => console.log('Full error:', error),
        },
      });
      
      // Log full error details
      console.error('Full error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
    } finally {
      setResending(false);
    }
  };

  if (verificationStatus === 'success') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4 sm:p-6">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-4">
                <Image 
                  src="/logo.svg" 
                  alt="Focusmate Logo" 
                  width={60} 
                  height={60}
                />
              </div>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-4">
                Your email has been successfully verified.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login...
              </p>
            </CardContent>
          </Card>
        </div>
        <SimpleFooter variant="public" />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4 sm:p-6">
        <Card className="w-full max-w-md mx-auto">
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
              <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Enter Verification Code</span>
            </CardTitle>
            <CardDescription className="text-center">
              We sent a 6-digit code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField>
                <FormLabel>Verification Code</FormLabel>
                <Input
                  {...register('code')}
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  disabled={isLoading}
                  className={`text-center text-2xl font-mono tracking-widest ${errors.code ? 'border-destructive' : ''}`}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setValue('code', value);
                  }}
                />
                <FormMessage>{errors.code?.message}</FormMessage>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </FormField>

              <input type="hidden" {...register('email')} />

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90 transition-opacity" 
                disabled={isLoading || codeValue.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/verify-email?email=${encodeURIComponent(email)}`)}
                  className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={canResendIn > 0 || resending || isLoading}
                  className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : canResendIn > 0 ? (
                    <>
                      <Mail className="h-3 w-3" />
                      Resend in {canResendIn}s
                    </>
                  ) : (
                    <>
                      <Mail className="h-3 w-3" />
                      Resend code
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-center text-slate-600">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <SimpleFooter variant="public" />
    </>
  );
}

