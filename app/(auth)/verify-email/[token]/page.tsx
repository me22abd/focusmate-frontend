'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { verifyEmail } from '@/lib/api/auth';
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Email verification failed');
      }
    };

    verify();
  }, [token, router]);

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-white via-[#F8FAFC] to-white p-4">
      <Card className="w-full max-w-md">
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
            <span className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] bg-clip-text text-transparent">Email Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified!
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h3>
              <p className="text-gray-600 mb-4">{message}</p>
            </div>
          )}
        </CardContent>
        {status === 'error' && (
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-90 transition-opacity">Go to Login</Button>
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
    <SimpleFooter variant="public" />
  </>
  );
}

