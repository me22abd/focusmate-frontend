# 🎨 Premium UI Pattern Guide

## Established Pattern

This document outlines the premium UI pattern established and how to apply it to remaining pages.

## Core Components

### 1. GlassCard
```tsx
import { GlassCard } from '@/components/ui/glass-card';

// Usage
<GlassCard delay={0.1} className="p-5">
  {/* Content */}
</GlassCard>
```

### 2. AnimatedButton
```tsx
import { AnimatedButton } from '@/components/ui/animated-button';

// Usage
<AnimatedButton glow onClick={handleClick}>
  Button Text
</AnimatedButton>
```

### 3. Gradient Background
```tsx
// Add to page container
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
    {/* Page content */}
  </div>
</div>
```

### 4. Gradient Text
```tsx
// For headings
<h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
  Heading
</h1>

// For numbers/values
<div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
  {value}
</div>
```

## Upgrade Steps

### For Each Page:

1. **Add Imports**
   ```tsx
   import { motion } from 'framer-motion';
   import { GlassCard } from '@/components/ui/glass-card';
   import { AnimatedButton } from '@/components/ui/animated-button';
   ```

2. **Wrap Page Content**
   - Add gradient background div
   - Add floating orbs
   - Wrap content in `relative z-10` div

3. **Upgrade Cards**
   - Replace `<Card>` with `<GlassCard delay={...}>`
   - Wrap Card component inside: `<Card className="border-0 shadow-none bg-transparent">`
   - Add gradient text to headings/numbers

4. **Upgrade Buttons**
   - Replace `<Button>` with `<AnimatedButton>`
   - Add `glow` prop for primary actions

5. **Enhance Typography**
   - Apply gradient text to main headings
   - Use consistent spacing (mt-1, mt-2, etc.)
   - Use font-bold for emphasis

## Completed Pages

✅ Landing Page (`app/page.tsx`)
✅ User Dashboard (`app/dashboard/page.tsx`)
✅ Admin Dashboard (`app/admin/dashboard/page.tsx`)

## Remaining Pages

### User Pages
- Settings (`app/settings/page.tsx`)
- Analytics (`app/analytics/page.tsx`)
- Sessions List (`app/sessions/page.tsx`)
- Session Setup (`app/session/setup/page.tsx`)
- Session Matchmaking (`app/session/matchmaking/page.tsx`)
- Session Active (`app/session/active/page.tsx`)
- Session Summary (`app/session/summary/page.tsx`)

### Admin Pages
- Admin Users (`app/admin/users/page.tsx`)
- Admin Sessions (`app/admin/sessions/page.tsx`)
- Admin Analytics (`app/admin/analytics/page.tsx`)
- Admin Settings (`app/admin/settings/page.tsx`)

## Notes

- Maintain all existing functionality
- Preserve responsive design
- Keep accessibility features
- Use consistent delay values for staggered animations (0.1, 0.15, 0.2, etc.)

