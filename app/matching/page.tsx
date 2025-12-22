'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Navbar } from '@/components/navbar';
import { BottomNav } from '@/components/bottom-nav';
import { SimpleFooter } from '@/components/simple-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Target, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MatchingPage() {
  useAuthGuard();
  const router = useRouter();

  const handleStartMatching = () => {
    router.push('/session/setup?mode=partner&duration=25');
  };

  const benefits = [
    {
      icon: Users,
      title: 'Accountability',
      description: 'Stay focused with a partner who shares your goals',
    },
    {
      icon: Clock,
      title: 'Synchronized Sessions',
      description: 'Work together in real-time with shared timers',
    },
    {
      icon: Target,
      title: 'Better Results',
      description: 'Studies show partner sessions increase productivity by 40%',
    },
    {
      icon: Zap,
      title: 'Quick Matching',
      description: 'Get matched in seconds with someone ready to focus',
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/30 px-4 pb-24 pt-6 dark:from-slate-950 dark:via-indigo-950/20 dark:to-blue-950/20">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/60 bg-gradient-to-r from-white to-slate-50 p-6 shadow-[0_25px_50px_-24px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/60"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">
                Matching
              </p>
              <h1 className="mt-3 text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Find Your Focus Partner
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Get matched with accountability partners for focused work sessions.
              </p>
            </div>
          </motion.section>

          {/* Main Action Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-8 text-center shadow-xl dark:border-indigo-800 dark:from-indigo-950/30 dark:to-blue-950/30"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
              Ready to Focus Together?
            </h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              Start a partner session and get matched with someone who's also ready to focus right now.
            </p>
            <Button
              onClick={handleStartMatching}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Users className="mr-2 h-5 w-5" />
              Start Matching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Card className="border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                      <benefit.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Set up your focus session with topic and duration' },
                { step: 2, text: 'Get matched with a partner who shares similar goals' },
                { step: 3, text: 'Start your synchronized focus session together' },
                { step: 4, text: 'Stay accountable and achieve your goals' },
              ].map((item, index) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <p className="pt-1 text-slate-700 dark:text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats or Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <Card className="border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-green-600 dark:text-green-400">40%</div>
                <div className="text-sm text-green-800 dark:text-green-300">More Productive</div>
              </CardContent>
            </Card>
            <Card className="border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-400">2-5 min</div>
                <div className="text-sm text-blue-800 dark:text-blue-300">Average Match Time</div>
              </CardContent>
            </Card>
            <Card className="border border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
              <CardContent className="p-4 text-center">
                <div className="mb-2 text-2xl font-bold text-purple-600 dark:text-purple-400">100%</div>
                <div className="text-sm text-purple-800 dark:text-purple-300">Free to Use</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <BottomNav />
      <SimpleFooter variant="auth" />
    </>
  );
}





