'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Copy, Loader2, Sparkles, AlertCircle, CheckCircle2, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FocusAICharacter } from '@/components/mascot/FocusAICharacter';
import { generateEmailReply, type EmailSupportResponse } from '@/lib/api/ai';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminEmailHelperPage() {
  const { user } = useAuthStore();
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailContext, setEmailContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<EmailSupportResponse | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [mascotPose, setMascotPose] = useState<'read' | 'idea'>('read');
  const resultsRef = useRef<HTMLDivElement>(null);

  // Switch to idea pose when reply is generated
  useEffect(() => {
    if (aiResponse) {
      setMascotPose('idea');
      const timer = setTimeout(() => {
        setMascotPose('read');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [aiResponse]);

  // Auto-scroll to results
  useEffect(() => {
    if (aiResponse && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [aiResponse]);

  const handleGenerateReply = async () => {
    if (!emailBody.trim()) {
      toast.error('Please enter an email body to generate a reply');
      return;
    }

    setIsGenerating(true);
    setAiResponse(null);

    try {
      const response = await generateEmailReply({
        subject: emailSubject || 'No Subject',
        body: emailBody,
        context: emailContext || undefined,
      });

      // Handle both old format (just reply string) and new format (EmailSupportResponse object)
      if (typeof response === 'string') {
        // Legacy format - just reply text
        setAiResponse({
          replyBody: response,
          replySubject: emailSubject || 'Re: Support Request',
        });
        setEditedReply(response);
      } else {
        // New format - full response object
        setAiResponse(response);
        setEditedReply(response.replyBody || '');
      }
      toast.success('AI reply generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate email reply:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI reply. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!editedReply) return;

    navigator.clipboard.writeText(editedReply);
    toast.success('Reply copied to clipboard!');
  };

  const handleClear = () => {
    setEmailSubject('');
    setEmailBody('');
    setEmailContext('');
    setAiResponse(null);
    setEditedReply('');
    setMascotPose('read');
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-300 dark:border-green-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getClassificationColor = (classification?: string) => {
    switch (classification) {
      case 'bug':
        return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400';
      case 'billing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400';
      case 'question':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
      case 'feature-request':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400';
      case 'account-issue':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400';
      case 'spam':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent mb-2">
            AI Email Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Generate professional email replies with AI assistance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Incoming Email
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject (optional)"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="body">Email Body *</Label>
                  <Textarea
                    id="body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Paste the incoming support email here..."
                    className="mt-1 min-h-[300px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="context">Additional Context (optional)</Label>
                  <Textarea
                    id="context"
                    value={emailContext}
                    onChange={(e) => setEmailContext(e.target.value)}
                    placeholder="Any additional context about the user or situation..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleGenerateReply}
                    disabled={isGenerating || !emailBody.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate AI Reply
                      </>
                    )}
                  </Button>
                  {(emailSubject || emailBody || emailContext) && (
                    <Button
                      onClick={handleClear}
                      variant="outline"
                      disabled={isGenerating}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </CardContent>
            </GlassCard>

            {/* Loading State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GlassCard className="p-8 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-foreground mb-2">
                      FocusAI is drafting your reply...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI Response Panel */}
            <AnimatePresence>
              {aiResponse && (
                <motion.div
                  ref={resultsRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'relative',
                    aiResponse.priority === 'urgent' && 'ring-2 ring-red-500/50 rounded-xl p-1'
                  )}
                >
                  <GlassCard className="p-6">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          AI-Generated Reply
                        </CardTitle>
                        <div className="flex gap-2">
                          {aiResponse.priority && (
                            <span className={cn(
                              'px-3 py-1 text-xs font-semibold rounded-full border capitalize',
                              getPriorityColor(aiResponse.priority)
                            )}>
                              {aiResponse.priority}
                            </span>
                          )}
                          {aiResponse.classification && (
                            <span className={cn(
                              'px-3 py-1 text-xs font-semibold rounded-full capitalize',
                              getClassificationColor(aiResponse.classification)
                            )}>
                              {aiResponse.classification.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4">
                      {/* Reply Subject */}
                      <div>
                        <Label>Reply Subject</Label>
                        <Input
                          value={aiResponse.replySubject || `Re: ${emailSubject || 'Support Request'}`}
                          onChange={(e) => setAiResponse({ ...aiResponse, replySubject: e.target.value })}
                          className="mt-1"
                          placeholder="Reply subject"
                        />
                      </div>

                      {/* Reply Body (Editable) */}
                      <div>
                        <Label>Reply Body</Label>
                        <Textarea
                          value={editedReply}
                          onChange={(e) => setEditedReply(e.target.value)}
                          className="mt-1 min-h-[300px] font-mono text-sm"
                          placeholder="AI-generated reply will appear here..."
                        />
                      </div>

                      {/* Confidence Score */}
                      {aiResponse.confidence !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Info className="h-4 w-4" />
                          <span>
                            Confidence: {Math.round(aiResponse.confidence * 100)}%
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <Button
                          onClick={handleCopyToClipboard}
                          variant="outline"
                          className="flex-1"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy to Clipboard
                        </Button>
                        <Button
                          variant="outline"
                          disabled
                          className="flex-1 opacity-50 cursor-not-allowed"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Send via Email
                        </Button>
                      </div>
                    </CardContent>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - FocusAI Mascot */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <FocusAICharacter pose={mascotPose} size="lg" animate />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">FocusAI Assistant</h3>
                  <p className="text-sm text-muted-foreground">
                    {isGenerating
                      ? 'Analyzing the email and crafting a professional reply...'
                      : aiResponse
                      ? 'Reply generated! Review and customize as needed.'
                      : 'Paste an email and I\'ll help you craft a professional reply.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

