'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Play, User } from 'lucide-react';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MatchedPage() {
  const { session, startSession } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No active session</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto"
          >
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
            Match Found!
          </CardTitle>
          <CardDescription>
            Get ready to focus with your accountability partner
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Partner Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4 p-4 rounded-lg bg-accent/50"
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-bold">
              {session.partnerName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{session.partnerName}</h3>
              <p className="text-sm text-muted-foreground">Ready to focus</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          </motion.div>

          {/* Session Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2 text-center"
          >
            <p className="text-sm text-muted-foreground">Session Duration</p>
            <p className="text-3xl font-bold">25 minutes</p>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              onClick={startSession}
              className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90 transition-opacity text-lg py-6"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Session
            </Button>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-sm text-muted-foreground space-y-1"
          >
            <p>✓ Turn on your camera (optional)</p>
            <p>✓ Have your task ready</p>
            <p>✓ Say hi to your partner!</p>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}













