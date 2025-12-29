# Batch Upgrade Script Guide

To efficiently upgrade all remaining pages, use this pattern:

## Pattern to Apply:

1. **Add imports:**
```tsx
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
```

2. **Replace background container:**
```tsx
// OLD:
<div className="min-h-screen bg-slate-50 dark:bg-slate-950">

// NEW:
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

  <div className="relative z-10">
    {/* Content here */}
  </div>
</div>
```

3. **Wrap Cards with GlassCard:**
```tsx
// OLD:
<Card className="...">

// NEW:
<GlassCard delay={0.1}>
  <Card className="border-0 shadow-none bg-transparent">
    {/* Card content */}
  </Card>
</GlassCard>
```

4. **Upgrade headings:**
```tsx
// OLD:
<h1 className="text-3xl font-bold">Title</h1>

// NEW:
<h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Title</h1>
```

5. **Upgrade buttons:**
```tsx
// OLD:
<Button>Click</Button>

// NEW (for primary actions):
<AnimatedButton glow>Click</AnimatedButton>
```

## Remaining Pages:

### User Pages:
- [ ] Sessions List (`app/sessions/page.tsx`)
- [ ] Session Setup (`app/session/setup/page.tsx`)
- [ ] Session Matchmaking (`app/session/matchmaking/page.tsx`)
- [ ] Session Active (`app/session/active/page.tsx`)
- [ ] Session Summary (`app/session/summary/page.tsx`)
- [ ] Login (`app/(auth)/login/page.tsx`)
- [ ] Register (`app/(auth)/register/page.tsx`)

### Admin Pages:
- [ ] Admin Users (`app/admin/users/page.tsx`)
- [ ] Admin Sessions (`app/admin/sessions/page.tsx`)
- [ ] Admin Analytics (`app/admin/analytics/page.tsx`)
- [ ] Admin Settings (`app/admin/settings/page.tsx`)

