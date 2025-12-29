/**
 * Premium Landing Page - Mixed Style (Headspace + Duolingo + Notion)
 * Smooth animations, glassmorphism, gamified elements, and modern design
 */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AnimatedButton } from '@/components/ui/animated-button';
import { GlassCard } from '@/components/ui/glass-card';
import { MascotPlaceholder } from '@/components/gamification';
import { Zap, Users, TrendingUp, Lock, Sparkles, ArrowRight, Check } from 'lucide-react';

const featureCards = [
  {
    icon: Zap,
    title: 'Instant Matching',
    description: 'Get paired with a focus partner in seconds. No waiting, no scheduling—just pure productivity.',
    gradient: 'from-purple-500/20 to-blue-500/20',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Real-Time Sessions',
    description: 'Stay accountable with synced focus timers and live partner presence. Together, we focus better.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'View streaks, insights, and weekly focus trends. Level up your productivity with data-driven insights.',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-500/10',
  },
  {
    icon: Lock,
    title: 'Secure & Private',
    description: 'All sessions encrypted. Your data stays private. Focus without worry.',
    gradient: 'from-teal-500/20 to-emerald-500/20',
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-500/10',
  },
];

const benefits = [
  'Free forever - no credit card required',
  'Match in seconds with real accountability partners',
  'Track your focus streaks and level up',
  'Join thousands building better focus habits',
];

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Animated Background */}
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

        {/* Hero Section */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-32">
          <div className="flex flex-col items-center text-center">
            
            {/* Logo with animation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image 
                src="/logo.svg"
                alt="Focusmate Logo" 
                width={120} 
                height={120} 
                priority
                className="drop-shadow-2xl"
              />
            </motion.div>
            
            {/* Main Headline */}
            <motion.div
              className="mt-8 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.p
                className="text-sm font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Work Smarter, Together
              </motion.p>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Focusmate
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200">
                Focus together. Achieve more.
              </p>
              
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Real-time accountability partners, gamified focus sessions, and beautiful insights 
                to keep your deep work on track.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/register">
                <AnimatedButton
                  size="lg"
                  className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl"
                  glow
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </AnimatedButton>
              </Link>
              
              <Link href="/login">
                <AnimatedButton
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg border-2"
                >
                  Sign In
                </AnimatedButton>
              </Link>
            </motion.div>

            {/* Benefits List */}
            <motion.div
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {featureCards.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <GlassCard
                    className="h-full p-6 group cursor-pointer"
                    hover
                    delay={index * 0.1}
                  >
                    <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Mascot Section */}
          <motion.div
            className="mt-32 flex flex-col items-center text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MascotPlaceholder size="lg" />
            <h2 className="mt-8 text-3xl font-bold text-gray-900 dark:text-white">
              Your AI Focus Companion Coming Soon
            </h2>
            <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">
              Meet your future productivity partner. Powered by AI to help you stay focused, 
              track progress, and achieve your goals.
            </p>
          </motion.div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
