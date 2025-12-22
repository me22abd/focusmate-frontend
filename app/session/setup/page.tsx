/**
 * ============================================================================
 * SESSION/SETUP/PAGE.TSX - SESSION SETUP & CONFIGURATION PAGE
 * ============================================================================
 * 
 * Purpose: Pre-session configuration page where users define their focus topic,
 * study goals, and confirm duration before starting either a solo or partner
 * session. Acts as the bridge between dashboard/mode selection and active session.
 * 
 * Architecture Role: Session flow orchestrator. Receives mode and duration from
 * URL params (from dashboard), collects focus details via FocusSetupForm, then
 * routes to appropriate next step: solo → /session/active, partner → /session/matchmaking.
 * 
 * ============================================================================
 * 📘 CODE ORIGIN (REQUIRED FOR ACADEMIC HONESTY)
 * ============================================================================
 * 
 * a) FRAMEWORK CODE (Not original):
 * ───────────────────────────────────────────────────────────────────────────
 * - 'use client' directive                       [Line 1]
 * - useRouter, useSearchParams (Next.js)         [Line 3]
 * - Component structure
 * 
 * Why Standard: Next.js App Router patterns
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * b) ADAPTED PATTERNS:
 * ───────────────────────────────────────────────────────────────────────────
 * - Setup page layout                            [Lines 37-68]
 * - Card-based form container                    [Lines 42-63]
 * - URL parameter parsing                        [Lines 15-16]
 * 
 * Sources:
 * - Multi-step form patterns (common in onboarding flows)
 * - URL state management (Next.js examples)
 * 
 * What I Customized:
 * 1. URL Params: MY specific parameters (duration, mode)
 * 2. Routing Logic: MY conditional navigation (solo vs partner)
 * 3. Layout: MY gradient icon, centered card design
 * 
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * c) MY CUSTOM CODE (100% Original for Focusmate):
 * ───────────────────────────────────────────────────────────────────────────
 * 
 * 1. URL PARAMETER PARSING [Lines 15-16]:
 *    MY implementation of state passing via URL:
 *    - duration: Parse from query string, default 25
 *    - mode: 'solo' or 'partner'
 *    - Passed from dashboard via router.push()
 * 
 * 2. HANDLESTART ROUTING LOGIC [Lines 18-35]:
 *    MY complete implementation of post-setup navigation:
 *    - Build URLSearchParams with form data
 *    - Solo mode: Add mode + startTime, navigate to /session/active
 *    - Partner mode: Navigate to /session/matchmaking (find partner first)
 *    - Preserves all data via URL params
 * 
 * 3. CONDITIONAL ICON DISPLAY [Lines 44-50]:
 *    MY implementation of mode-based UI:
 *    - Solo: User icon (single person)
 *    - Partner: Users icon (two people)
 *    - Visual indicator of session type
 * 
 * 4. CONDITIONAL DESCRIPTION [Lines 54-58]:
 *    MY implementation of mode-specific messaging:
 *    - Solo: "Set up your solo focus session"
 *    - Partner: "Set up... before finding a partner"
 *    - Clear expectations about next step
 * 
 * 5. FOCUSSETUPFORM INTEGRATION [Lines 61]:
 *    MY custom component (defined elsewhere):
 *    - initialDuration prop (from URL)
 *    - onStart callback (handleStart function)
 *    - Collects focusTopic, studyGoal, duration, taskId
 * 
 * My Design Decisions:
 * ──────────────────────────────────────────────────────────────────────────
 * ✨ URL-based state (enables deep linking, back button support)
 * ✨ Conditional routing (solo vs partner flow diverges here)
 * ✨ Start time injection (solo sessions start immediately on this page)
 * ✨ Mode-specific UI (icon, description adapt to context)
 * ✨ Centered card layout (focused, distraction-free setup)
 * ✨ Gradient branding (consistent visual identity)
 * 
 * ============================================================================
 * 
 * @author Eromonsele Marvelous
 * @page Frontend/Session
 */

// Framework pattern: Client-side interactivity
'use client';

// Framework imports
import { useRouter, useSearchParams } from 'next/navigation';

// Custom: MY auth guard hook
import { useAuthGuard } from '@/hooks/use-auth-guard';

// Custom: MY components
import { Navbar } from '@/components/navbar';
import { SimpleFooter } from '@/components/simple-footer';
import { FocusSetupForm } from '@/components/focus-setup-form';

// Adapted: ShadCN UI components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Adapted: Icon library
import { Users, User } from 'lucide-react';

/**
 * Session Setup Page Component
 */
export default function SetupPage() {
  // Custom: Protect route (redirect if not authenticated)
  useAuthGuard();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ===========================================================================
  // 📘 CODE ORIGIN: URL Parameter Parsing
  // ===========================================================================
  // Custom implementation by me: State passing via URL
  // 
  // What I Built:
  // Extract setup parameters from URL query string.
  // 
  // Parameters:
  // - duration: Session length in minutes (default: 25)
  // - mode: 'solo' or 'partner'
  // 
  // Source:
  // Dashboard passes these via router.push(`/session/setup?duration=X&mode=Y`)
  // 
  // Why URL State:
  // - Enables deep linking (user can bookmark setup with specific duration)
  // - Supports back button (browser history works correctly)
  // - Simple state passing without complex state management
  // ===========================================================================
  const duration = parseInt(searchParams.get('duration') || '25', 10);
  const mode = searchParams.get('mode') || 'solo';

  // ===========================================================================
  // 📘 CODE ORIGIN: Post-Setup Navigation Logic
  // ===========================================================================
  // Custom implementation by me: Conditional routing based on mode
  // 
  // What I Built:
  // Complete routing logic after user completes setup form.
  // 
  // My Flow:
  // 1. Receive form data (focusTopic, studyGoal, duration, taskId)
  // 2. Build URLSearchParams with this data
  // 3. Solo mode: Add startTime (session starts immediately) → /session/active
  // 4. Partner mode: → /session/matchmaking (find partner first)
  // 
  // Why Different Paths:
  // - Solo sessions start immediately (no waiting for partner)
  // - Partner sessions require matchmaking first
  // - Both preserve setup data via URL params
  // 
  // Design Decision:
  // StartTime added here for solo (marks session start), but not for partner
  // (partner session starts when match is found).
  // ===========================================================================
  const handleStart = (data: { 
    focusTopic: string; 
    studyGoal?: string; 
    duration: number; 
    taskId?: string 
  }) => {
    // Custom: Build URL parameters with form data
    const params = new URLSearchParams({
      duration: data.duration.toString(),
      focusTopic: data.focusTopic,
      ...(data.studyGoal && { studyGoal: data.studyGoal }),  // Optional
      ...(data.taskId && { taskId: data.taskId }),            // Optional
    });

    if (mode === 'solo') {
      // -----------------------------------------------------------------------
      // Custom: Solo Session Flow
      // -----------------------------------------------------------------------
      // Add mode and start time for solo sessions
      // StartTime = now (session starts immediately)
      params.append('mode', 'solo');
      params.append('startTime', new Date().toISOString());
      
      // Navigate directly to active session
      router.push(`/session/active?${params.toString()}`);
      
    } else {
      // -----------------------------------------------------------------------
      // Custom: Partner Session Flow
      // -----------------------------------------------------------------------
      // For partner mode, go to matchmaking first
      // No startTime yet (will be added when match is found)
      router.push(`/session/matchmaking?${params.toString()}`);
    }
  };

  return (
    <>
      {/* Custom: MY navbar */}
      <Navbar />
      
      <div className="min-h-screen bg-slate-50 px-4 sm:px-6 pb-24 pt-6 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center py-6 sm:py-12">
          
          {/* Custom: Centered card layout (focused, distraction-free) */}
          <Card className="w-full border-2 shadow-2xl">
            
            {/* =================================================================
                CARD HEADER - Mode-Specific Icon and Title
                =================================================================
                
                📘 CODE ORIGIN: Custom Implementation
                ──────────────────────────────────────────────────────────────
                What I Built: Mode-aware header display
                
                My Implementation:
                - Gradient icon background (brand colors)
                - Conditional icon (User for solo, Users for partner)
                - Gradient title text
                - Conditional description based on mode
                ============================================================== */}
            <CardHeader className="space-y-4 text-center">
              {/* Custom: Gradient icon container */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400">
                {/* Custom: Conditional icon based on mode */}
                {mode === 'solo' ? (
                  <User className="h-8 w-8 text-white" />     // Solo: Single person
                ) : (
                  <Users className="h-8 w-8 text-white" />    // Partner: Two people
                )}
              </div>
              
              {/* Custom: Gradient title */}
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Session Setup
              </CardTitle>
              
              {/* Custom: Mode-specific description */}
              <CardDescription className="text-base">
                {mode === 'solo'
                  ? 'Set up your solo focus session'
                  : 'Set up your focus session before finding a partner'}
              </CardDescription>
            </CardHeader>
            
            {/* =================================================================
                FORM CONTENT
                =================================================================
                
                📘 CODE ORIGIN: Custom Component Integration
                ──────────────────────────────────────────────────────────────
                What I Built: FocusSetupForm component integration
                
                My Component: FocusSetupForm (defined in /components)
                Props:
                - initialDuration: Pre-filled from URL (user chose this on dashboard)
                - onStart: Callback when form is submitted (handleStart function)
                
                Form collects:
                - focusTopic: What user will focus on
                - studyGoal: Optional specific goal
                - duration: Session length (can be adjusted from initial)
                - taskId: Optional task association (future feature)
                ============================================================== */}
            <CardContent>
              <FocusSetupForm 
                initialDuration={duration}   // Custom: Pre-fill from URL
                onStart={handleStart}         // Custom: MY routing logic
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Custom: MY footer */}
      <SimpleFooter variant="auth" />
    </>
  );
}

/**
 * ============================================================================
 * WHAT I BUILT VS WHAT I ADAPTED
 * ============================================================================
 * 
 * FRAMEWORK CODE (Not original):
 * ❌ useRouter, useSearchParams (Next.js hooks)
 * ❌ 'use client' directive
 * 
 * LIBRARY COMPONENTS (Adapted):
 * 🔄 Card components (ShadCN UI, my styling)
 * 🔄 Icons (Lucide, my selection and conditional logic)
 * 
 * MY CUSTOM IMPLEMENTATIONS:
 * ✅ URL parameter parsing (duration, mode extraction)
 * ✅ handleStart routing logic (conditional navigation)
 * ✅ Solo vs partner flow divergence (different next steps)
 * ✅ Start time injection (solo only, marks session start)
 * ✅ URLSearchParams building (preserve form data)
 * ✅ Conditional icon display (User vs Users)
 * ✅ Conditional description (mode-specific messaging)
 * ✅ FocusSetupForm integration (component props)
 * ✅ Centered card layout (focused UI)
 * ✅ Gradient branding (icon, title)
 * ✅ All routing paths (/session/active, /session/matchmaking)
 * 
 * ============================================================================
 * HOW TO EXPLAIN DURING VIVA
 * ============================================================================
 * 
 * Question: "How does your session setup flow work?"
 * 
 * Answer:
 * "The setup page is a crucial intermediary in the session flow:
 * 
 * **URL-Based State Management:**
 * Users arrive here from the dashboard with `duration` and `mode` in the URL
 * (e.g., /session/setup?duration=25&mode=solo). I parse these with useSearchParams
 * and use them to pre-fill the form and configure the UI. This approach enables
 * deep linking and proper back button behavior.
 * 
 * **Conditional Flow Divergence:**
 * This is where solo and partner flows diverge. My handleStart function builds
 * URLSearchParams with the form data (focusTopic, studyGoal, duration), then:
 * 
 * - **Solo Mode**: Adds `startTime` (current timestamp) and navigates directly
 *   to /session/active. The session starts immediately.
 *   
 * - **Partner Mode**: Navigates to /session/matchmaking without a startTime.
 *   The session will start when a partner is found.
 * 
 * **Mode-Aware UI:**
 * The interface adapts to the mode - solo shows a User icon, partner shows Users
 * icon. The description text also changes to set proper expectations.
 * 
 * **FocusSetupForm Component:**
 * I created a separate form component that handles the focus topic input,
 * goal setting, and duration adjustment. It receives initialDuration from the
 * URL and calls onStart when submitted, keeping the page component clean.
 * 
 * **Why This Design:**
 * Having a dedicated setup page (rather than inline in dashboard) allows users
 * to thoughtfully define their focus before committing to a session. It also
 * provides a clear step in the flow: choose mode → configure details → start/match.
 * 
 * All data is preserved through URL parameters, making the flow stateless and
 * resilient to page refreshes."
 * 
 * ============================================================================
 */
