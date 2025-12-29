'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a code to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset code to your email. Please check your inbox.
                </p>
                <Button
                  onClick={() => router.push('/reset-password')}
                  className="w-full"
                >
                  Enter Reset Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  Send Another Code
                </Button>
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center text-sm">
              <Link href="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <SimpleFooter />
    </div>
  );
}












