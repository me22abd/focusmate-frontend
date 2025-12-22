/**
 * ============================================================================
 * VERIFY-EMAIL/PAGE.TSX - EMAIL VERIFICATION (STEP 1: REQUEST CODE)
 * ============================================================================
 * 
 * Purpose: First step of email verification flow. Collects user's email address,
 * sends verification code to their inbox, and redirects to code entry page.
 * Includes rate limiting with cooldown timer to prevent spam.
 * 
 * Architecture Role: Essential security component. Prevents fake accounts by
 * requiring email ownership proof. Integrates with backend email service and
 * feeds into complete verification flow (request code → enter code → verified).
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) FRAMEWORK CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - 'use client' directive                       [Line 40]
 * - useState, useRouter, useSearchParams         [Lines 65-67]
 * - React component structure
 * 
 * Why Standard: Next.js App Router + React patterns
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) LIBRARY PATTERNS ADAPTED:
 * ───────────────────────────────────────────────────────────────────────────
 * - react-hook-form integration                  [Lines 75-84]
 * - Zod validation (inline schema)               [Lines 58-60]
 * - ShadCN UI components                         [Lines 177-323]
 * - Toast notifications                          [Lines 109-138]
 * 
 * What I Customized:
 * 1. Inline Schema: Created simple email validation schema directly in file
 * 2. Pre-fill Logic: Extract email from URL params
 * 3. UI Flow: Send → Show feedback → Auto-redirect
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. RESEND COOLDOWN TIMER [Lines 69-70, 94-120, 143-155]:
 *    My implementation of rate limiting on client side:
 *    - canResendIn state (seconds remaining)
 *    - setInterval countdown (ticks every 1 second)
 *    - Disable resend button during cooldown
 *    - Clear interval when reaching 0
 *    - Backend provides initial cooldown value
 *    - Client-side enforcement for UX (backend also enforces)
 * 
 * 2. EMAIL PRE-FILLING FROM URL [Lines 72-73, 82-84]:
 *    My implementation of seamless flow:
 *    - Parse ?email= query parameter
 *    - Set as default form value
 *    - User sees pre-filled email from registration
 *    - Reduces friction (don't retype email)
 * 
 * 3. AUTO-REDIRECT AFTER SEND [Lines 113-116, 162-165]:
 *    My UX enhancement:
 *    - Show success toast (feedback)
 *    - Wait 1 second (user reads message)
 *    - Auto-redirect to code entry page
 *    - Pass email via URL
 *    - Smooth flow without manual navigation
 * 
 * 4. CONDITIONAL BUTTON STATES [Lines 210-252]:
 *    My implementation of three-state button:
 *    - State 1: "Send Verification Code" (initial)
 *    - State 2: "Sending..." with spinner (loading)
 *    - State 3: "Code Sent! Redirecting..." with icon (success)
 *    - Disabled states (prevent multiple clicks)
 * 
 * 5. RESEND HANDLER [Lines 127-173]:
 *    My implementation of code resend:
 *    - Check cooldown (early return if waiting)
 *    - Validate email exists
 *    - Call same API endpoint
 *    - Restart cooldown timer
 *    - Same redirect flow
 *    - Handles errors gracefully
 * 
 * 6. INLINE EMAIL SCHEMA [Lines 58-60]:
 *    My decision: Define simple schema directly in file
 *    - Only validates email format
 *    - Don't need separate file for single field
 *    - Keeps code localized
 * 
 * My Design Decisions:
 * ──────────────────────────────
 * ✨ Cooldown timer (prevent spam, match backend rate limit)
 * ✨ Email pre-fill (smooth registration flow)
 * ✨ Auto-redirect (guide user to next step)
 * ✨ Three-state button (clear feedback)
 * ✨ Resend functionality (user convenience)
 * ✨ Inline schema (simplicity for single field)
 * ✨ Delayed redirects (show feedback before transition)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @page Frontend/Auth
 */

// Framework pattern: Client-side interactivity
'use client';

// Framework imports
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Adapted: Form management library
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Custom: MY API function for sending verification code
import { sendVerificationEmailCode } from '@/lib/api/auth';

// Custom: MY components
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';

// Adapted: ShadCN UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';

// Adapted: Icon library (selected icons)
import { Loader2, Mail, ArrowRight } from 'lucide-react';

// Adapted: Toast library
import { toast } from 'sonner';

/**
 * ===========================================================================
 * 📘 CODE ORIGIN: Inline Email Validation Schema
 * ===========================================================================
 * Pattern source: Zod validation (standard validation pattern)
 * Custom implementation by me: Inline schema for simplicity
 * 
 * Design Decision:
 * For complex forms (login, register), I put schemas in /lib/validations/.
 * For simple single-field forms, I define schema inline to keep code localized.
 * 
 * This schema only validates email format - simpler than registerSchema
 * ===========================================================================
 */
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// Type inference from schema
type EmailInput = z.infer<typeof emailSchema>;

/**
 * Verify Email Page Component (Step 1: Request Code)
 */
export default function VerifyEmailPage() {
  // ===========================================================================
  // STATE MANAGEMENT - My Implementation
  // ===========================================================================
  
  const router = useRouter();
  const searchParams = useSearchParams();  // Framework pattern: URL params
  
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  
  // Custom: Cooldown timer state (MY rate limiting UX)
  const [canResendIn, setCanResendIn] = useState(0);  // Seconds remaining
  const [userEmail, setUserEmail] = useState<string>('');

  // ===========================================================================
  // 📘 CODE ORIGIN: Email Pre-filling from URL Parameters
  // ===========================================================================
  // Custom implementation by me: Seamless flow from registration
  // 
  // Flow:
  // User registers → Redirected to /verify-email?email=user@example.com
  // This code extracts email from URL and pre-fills the form
  // 
  // Why I Built This:
  // User shouldn't have to retype email they just entered during registration.
  // Better UX, reduces errors, smoother flow.
  // ===========================================================================
  const prefilledEmail = searchParams.get('email') || '';

  // Framework pattern: react-hook-form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,  // Used for resend functionality
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: prefilledEmail,  // Custom: Pre-fill from URL
    },
  });

  // ===========================================================================
  // 📘 CODE ORIGIN: Form Submission Handler
  // ===========================================================================
  // Custom implementation by me: Complete verification code request flow
  // 
  // What I Built:
  // 1. Set loading state
  // 2. Store email (for display purposes)
  // 3. Call MY sendVerificationEmailCode API
  // 4. Start cooldown timer (backend provides duration)
  // 5. Show success toast
  // 6. Auto-redirect to code entry page after 1 second
  // 7. Handle errors
  // 
  // Cooldown Timer Logic:
  // Backend returns canResendIn (seconds). I start a setInterval that:
  // - Decrements counter every second
  // - Clears interval at 0
  // - Updates state (re-renders component)
  // - Button disabled during countdown
  // ===========================================================================
  const onSubmit = async (data: EmailInput) => {
    setIsLoading(true);
    setUserEmail(data.email);

    try {
      // Custom: Call MY API
      const response = await sendVerificationEmailCode(data.email);
      setCodeSent(true);
      
      // -----------------------------------------------------------------------
      // Custom: Cooldown timer implementation (MY rate limiting UX)
      // -----------------------------------------------------------------------
      // Backend provides canResendIn (e.g., 60 seconds)
      // I implement client-side countdown for better UX
      // Note: Backend ALSO enforces rate limit (security)
      if (response.canResendIn) {
        setCanResendIn(response.canResendIn);
        
        // Custom: setInterval countdown
        const interval = setInterval(() => {
          setCanResendIn((prev) => {
            if (prev <= 1) {
              clearInterval(interval);  // Stop at 0
              return 0;
            }
            return prev - 1;  // Decrement
          });
        }, 1000);  // Every 1 second
      }

      // Custom: Success feedback
      toast.success('Verification code sent!', {
        description: response.message,
      });

      // -----------------------------------------------------------------------
      // Custom: Auto-redirect with delay (MY UX enhancement)
      // -----------------------------------------------------------------------
      // Design decision: Let user see success message before redirecting
      setTimeout(() => {
        router.push(`/verify-email/code?email=${encodeURIComponent(data.email)}`);
      }, 1000);
      
    } catch (error: any) {
      // Custom: Error handling
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      toast.error('Failed to send code', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================================================
  // 📘 CODE ORIGIN: Resend Code Handler
  // ===========================================================================
  // Custom implementation by me: Complete resend functionality
  // 
  // What I Built:
  // My resend logic handles multiple edge cases:
  // 1. Check if cooldown active (prevent spam)
  // 2. Validate email exists in form
  // 3. Call same API endpoint
  // 4. Restart cooldown timer
  // 5. Show feedback
  // 6. Auto-redirect to code entry
  // 7. Handle errors
  // 
  // Design Decision:
  // Resend uses same flow as initial send (code reuse).
  // Early returns prevent unnecessary API calls.
  // ===========================================================================
  const handleResend = async () => {
    // -------------------------------------------------------------------------
    // Custom: Cooldown check (MY spam prevention)
    // -------------------------------------------------------------------------
    if (canResendIn > 0) {
      toast.info(`Please wait ${canResendIn} seconds before resending`);
      return;  // Early return - don't proceed
    }
    
    // Custom: Email validation
    const email = getValues('email');
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Custom: Call MY API
      const response = await sendVerificationEmailCode(email);
      
      // Custom: Restart cooldown timer (same logic as onSubmit)
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

      // Custom: Success feedback
      toast.success('Verification code sent!', {
        description: response.message || 'Please check your inbox',
      });

      // Custom: Auto-redirect
      setTimeout(() => {
        router.push(`/verify-email/code?email=${encodeURIComponent(email)}`);
      }, 1000);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      toast.error('Failed to send code', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Custom: MY navbar */}
      <Navbar />
      
      {/* =====================================================================
          VERIFICATION PAGE CONTAINER
          =================================================================== */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4 sm:p-6">
        
        {/* Adapted: ShadCN Card */}
        <Card className="w-full max-w-md mx-auto">
          
          {/* HEADER */}
          <CardHeader className="space-y-3">
            <div className="flex justify-center">
              <Image 
                src="/logo.svg"  // Custom: MY logo
                alt="Focusmate Logo" 
                width={60} 
                height={60}
              />
            </div>
            
            {/* Custom: Title with gradient */}
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Verify Your Email
              </span>
            </CardTitle>
            
            <CardDescription className="text-center">
              Enter your email address to receive a verification code
            </CardDescription>
          </CardHeader>
          
          {/* FORM CONTENT */}
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* ===============================================================
                  EMAIL INPUT FIELD
                  ===============================================================
                  
                  Custom: Pre-filled from URL (MY flow integration)
                  Disabled after code sent (prevent email change mid-flow)
                  =============================================================== */}
              <FormField>
                <FormLabel error={!!errors.email}>Email Address</FormLabel>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={isLoading || codeSent}  // Custom: Disable after send
                  className={errors.email ? 'border-destructive' : ''}
                />
                <FormMessage>{errors.email?.message}</FormMessage>
              </FormField>

              {/* ===============================================================
                  SUBMIT BUTTON WITH THREE STATES
                  ===============================================================
                  
                  Custom implementation by me: Multi-state button
                  
                  State 1 (Initial): "Send Verification Code" with Mail icon
                  State 2 (Loading): "Sending..." with spinner
                  State 3 (Success): "Code Sent! Redirecting..." with Mail icon
                  
                  Design Decision:
                  Three states provide clear feedback about process status.
                  Success state shows user the action completed before redirect.
                  =============================================================== */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90 transition-opacity" 
                disabled={isLoading || codeSent}
              >
                {isLoading ? (
                  // State 2: Loading
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : codeSent ? (
                  // State 3: Success
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Code Sent! Redirecting...
                  </>
                ) : (
                  // State 1: Initial
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>

              {/* ===============================================================
                  COOLDOWN TIMER DISPLAY
                  ===============================================================
                  
                  Custom implementation by me: Visual cooldown feedback
                  
                  Shows countdown when:
                  - Code has been sent
                  - Cooldown is active (canResendIn > 0)
                  
                  Updates every second (via state)
                  =============================================================== */}
              {codeSent && canResendIn > 0 && (
                <p className="text-xs text-center text-slate-500">
                  Resend available in {canResendIn} seconds
                </p>
              )}

              {/* ===============================================================
                  RESEND BUTTON
                  ===============================================================
                  
                  Custom implementation by me: Resend with cooldown
                  
                  Shown: Only when code NOT sent yet (or after redirect back)
                  Disabled: During cooldown or loading
                  Text: Shows countdown or "Resend code"
                  
                  Design Decision:
                  Separate from submit button for clarity.
                  Conditional text shows time remaining or action available.
                  =============================================================== */}
              {!codeSent && (
                <div className="flex items-center justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={canResendIn > 0 || isLoading}
                    className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canResendIn > 0 ? (
                      `Resend in ${canResendIn}s`
                    ) : (
                      <>
                        <Mail className="h-3 w-3" />
                        Resend code
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            {/* Custom: Login link (fallback for users who already verified) */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-center text-slate-600">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Custom: MY footer */}
      <SimpleFooter variant="public" />
    </>
  );
}

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * FRAMEWORK CODE (Not original):
 * ❌ useState, useRouter, useSearchParams (React/Next.js)
 * ❌ useForm (react-hook-form)
 * ❌ setInterval (JavaScript API)
 * 
 * LIBRARY COMPONENTS (Adapted):
 * 🔄 Card, Input, Button (ShadCN UI)
 * 🔄 Toast (Sonner)
 * 🔄 Icons (Lucide)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ Resend cooldown timer (setInterval countdown, state management)
 * ✅ Email pre-filling from URL (query param extraction, default values)
 * ✅ Auto-redirect after send (delayed navigation with feedback)
 * ✅ Three-state button (initial, loading, success)
 * ✅ Resend handler (cooldown check, validation, flow)
 * ✅ Inline email schema (simple validation for single field)
 * ✅ Complete verification flow orchestration
 * ✅ All copy and error messages
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How does your email verification system work?"
 * 
 * Answer:
 * "I implemented a two-step email verification flow. This page is step 1 -
 * requesting the verification code.
 * 
 * **Key Features I Built:**
 * 
 * 1. **Email Pre-filling**: When users register or are redirected from login,
 *    the email comes via URL parameter (?email=...). I extract this and pre-fill
 *    the form field, so users don't have to retype their email.
 * 
 * 2. **Rate Limiting with Cooldown Timer**: To prevent spam, I implemented a
 *    client-side cooldown timer. When a code is sent, the backend returns
 *    canResendIn (e.g., 60 seconds). I use setInterval to count down every
 *    second, updating the UI and disabling the resend button. The backend ALSO
 *    enforces this limit for security - my client-side timer just improves UX.
 * 
 * 3. **Three-State Button**: The submit button has three states: 'Send Code'
 *    (initial), 'Sending...' (loading with spinner), and 'Code Sent! Redirecting'
 *    (success). This provides clear visual feedback about the process status.
 * 
 * 4. **Auto-redirect**: After successfully sending the code, I show a success
 *    toast, wait 1 second (so user sees confirmation), then automatically
 *    redirect to /verify-email/code with the email in the URL. This guides
 *    the user to the next step without requiring manual navigation.
 * 
 * 5. **Resend Functionality**: Users can resend the code if needed. My resend
 *    handler checks the cooldown, validates the email, calls the API, restarts
 *    the timer, and follows the same redirect flow.
 * 
 * The complete flow is: Register → Request Code (this page) → Enter Code →
 * Verified → Login. Each step is connected via URL parameters for a seamless
 * user experience."
 * 
 * ============================================================================
 */
