'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Copy, Loader2, Sparkles, CheckCircle2, Clock, User, CheckSquare, Square } from 'lucide-react';
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
import { getSupportEmails, sendEmailReply, saveTemplate, type SupportEmail as APISupportEmail } from '@/lib/api/admin';

interface SupportEmail extends APISupportEmail {
  aiReply?: EmailSupportResponse;
  editedReply?: string;
  saveAsTemplate?: boolean;
}

// Storage key for support emails (simulated - replace with API call when backend is ready)
const SUPPORT_EMAILS_STORAGE_KEY = 'admin_support_emails';
const EMAIL_TEMPLATES_STORAGE_KEY = 'admin_email_templates';

export default function AdminEmailHelperPage() {
  const { user } = useAuthStore();
  const [supportEmails, setSupportEmails] = useState<SupportEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SupportEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mascotPose, setMascotPose] = useState<'read' | 'idea' | 'help'>('read');
  const [templates, setTemplates] = useState<string[]>([]);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load emails from backend (with localStorage fallback)
  useEffect(() => {
    const loadEmails = async () => {
      try {
        // Try backend API first
        const emails = await getSupportEmails();
        if (emails.length > 0) {
          setSupportEmails(emails.map(e => ({ ...e, editedReply: '', saveAsTemplate: false })));
          return;
        }
        
        // Fallback to localStorage if backend returns empty or not yet implemented
        const stored = localStorage.getItem(SUPPORT_EMAILS_STORAGE_KEY);
        if (stored) {
          setSupportEmails(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load emails from backend, using localStorage fallback:', error);
        // Fallback to localStorage on error
        try {
          const stored = localStorage.getItem(SUPPORT_EMAILS_STORAGE_KEY);
          if (stored) {
            setSupportEmails(JSON.parse(stored));
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError);
        }
      }
    };

    loadEmails();
  }, []);

  // Save emails to localStorage whenever they change
  useEffect(() => {
    if (supportEmails.length > 0) {
      localStorage.setItem(SUPPORT_EMAILS_STORAGE_KEY, JSON.stringify(supportEmails));
    }
  }, [supportEmails]);

  // Update mascot pose based on selection
  useEffect(() => {
    if (selectedEmail) {
      if (selectedEmail.status === 'sent') {
        setMascotPose('read');
      } else if (selectedEmail.aiReply) {
        setMascotPose('idea');
      } else {
        setMascotPose('help');
      }
    } else {
      setMascotPose('read');
    }
  }, [selectedEmail]);

  // Auto-scroll to results
  useEffect(() => {
    if (selectedEmail?.aiReply && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedEmail?.aiReply]);

  const handleGenerateReply = async () => {
    if (!selectedEmail) return;

    setIsGenerating(true);
    setMascotPose('idea');

    try {
      const response = await generateEmailReply({
        subject: selectedEmail.subject || 'No Subject',
        body: selectedEmail.message,
        context: undefined,
      });

      const updatedEmail: SupportEmail = {
        ...selectedEmail,
        aiReply: typeof response === 'string' 
          ? { replyBody: response, replySubject: `Re: ${selectedEmail.subject}` }
          : response,
        editedReply: typeof response === 'string' ? response : response.replyBody || '',
        status: 'ai_drafted',
      };

      setSupportEmails(prev => prev.map(e => e.id === selectedEmail.id ? updatedEmail : e));
      setSelectedEmail(updatedEmail);
      toast.success('AI reply generated successfully!');
    } catch (error: any) {
      console.error('Failed to generate email reply:', error);
      toast.error(error.response?.data?.message || 'Failed to generate AI reply. Please try again.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setMascotPose('read'), 4000);
    }
  };

  const handleSendReply = async () => {
    if (!selectedEmail || !selectedEmail.editedReply) {
      toast.error('Please generate and review a reply before sending');
      return;
    }

    setIsSending(true);

    try {
      // Send email via backend API
      await sendEmailReply(
        selectedEmail.id,
        selectedEmail.aiReply?.replySubject || `Re: ${selectedEmail.subject}`,
        selectedEmail.editedReply,
        selectedEmail.sender
      );

      const updatedEmail: SupportEmail = {
        ...selectedEmail,
        status: 'sent',
      };

      setSupportEmails(prev => prev.map(e => e.id === selectedEmail.id ? updatedEmail : e));
      setSelectedEmail(updatedEmail);

      // Save as template if checked
      if (selectedEmail.saveAsTemplate && selectedEmail.editedReply) {
        try {
          await saveTemplate(
            `Template ${new Date().toLocaleDateString()}`,
            selectedEmail.editedReply
          );
          // Also update localStorage as backup
          const newTemplates = [...templates, selectedEmail.editedReply];
          setTemplates(newTemplates);
          localStorage.setItem(EMAIL_TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates));
          toast.success('Reply sent and saved as template!');
        } catch (templateError) {
          console.error('Failed to save template, but email was sent:', templateError);
          toast.success('Reply sent successfully! (Template save failed)');
        }
      } else {
        toast.success('Reply sent successfully!');
      }
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(error.response?.data?.message || 'Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!selectedEmail?.editedReply) return;
    navigator.clipboard.writeText(selectedEmail.editedReply);
    toast.success('Reply copied to clipboard!');
  };

  const handleSelectEmail = (email: SupportEmail) => {
    setSelectedEmail(email);
  };

  const handleToggleTemplate = () => {
    if (!selectedEmail) return;
    const updated = { ...selectedEmail, saveAsTemplate: !selectedEmail.saveAsTemplate };
    setSelectedEmail(updated);
    setSupportEmails(prev => prev.map(e => e.id === selectedEmail.id ? updated : e));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-300 dark:border-green-800';
      case 'ai_drafted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-300 dark:border-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'ai_drafted':
        return 'AI Drafted';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent mb-2">
            AI Email Assistant
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage support emails and generate professional replies with AI assistance
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Email List */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Support Emails
                  <span className="ml-auto text-sm text-muted-foreground">
                    {supportEmails.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {supportEmails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No support emails yet</p>
                    <p className="text-xs mt-1">Select an email to view details</p>
                  </div>
                ) : (
                  supportEmails.map((email) => (
                    <motion.div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={cn(
                        'p-3 rounded-lg cursor-pointer border transition-all',
                        selectedEmail?.id === email.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700'
                          : 'bg-white/50 dark:bg-white/5 border-white/20 hover:bg-white/70 dark:hover:bg-white/10'
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-semibold rounded-full border capitalize',
                          getStatusColor(email.status)
                        )}>
                          {getStatusLabel(email.status)}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-foreground mb-1 truncate">
                        {email.subject || 'No Subject'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2 truncate">
                        {email.sender}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(email.timestamp)}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>

          {/* Middle Column - Email Details & Reply */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEmail ? (
              <>
                {/* Email Details */}
                <GlassCard className="p-6">
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        Email Details
                      </CardTitle>
                      <span className={cn(
                        'px-3 py-1 text-xs font-semibold rounded-full border capitalize',
                        getStatusColor(selectedEmail.status)
                      )}>
                        {getStatusLabel(selectedEmail.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">From</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{selectedEmail.sender}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Subject</Label>
                      <p className="text-sm font-medium text-foreground mt-1">{selectedEmail.subject || 'No Subject'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Received</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{formatTimestamp(selectedEmail.timestamp)}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Message</Label>
                      <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{selectedEmail.message}</p>
                      </div>
                    </div>
                    {selectedEmail.status !== 'ai_drafted' && selectedEmail.status !== 'sent' && (
                      <Button
                        onClick={handleGenerateReply}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90"
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
                    )}
                  </CardContent>
                </GlassCard>

                {/* AI Reply Panel */}
                <AnimatePresence>
                  {selectedEmail.aiReply && (
                    <motion.div
                      ref={resultsRef}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative"
                    >
                      <GlassCard className="p-6">
                        <CardHeader className="p-0 mb-6">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              AI-Generated Reply
                            </CardTitle>
                            <div className="flex gap-2">
                              {selectedEmail.aiReply.priority && (
                                <span className={cn(
                                  'px-3 py-1 text-xs font-semibold rounded-full border capitalize',
                                  selectedEmail.aiReply.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' :
                                  selectedEmail.aiReply.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                )}>
                                  {selectedEmail.aiReply.priority}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-0 space-y-4">
                          <div>
                            <Label>Reply Subject</Label>
                            <Input
                              value={selectedEmail.aiReply.replySubject || `Re: ${selectedEmail.subject}`}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedEmail,
                                  aiReply: { ...selectedEmail.aiReply!, replySubject: e.target.value },
                                };
                                setSelectedEmail(updated);
                                setSupportEmails(prev => prev.map(e => e.id === selectedEmail.id ? updated : e));
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label>Reply Body</Label>
                            <Textarea
                              value={selectedEmail.editedReply || ''}
                              onChange={(e) => {
                                const updated = { ...selectedEmail, editedReply: e.target.value };
                                setSelectedEmail(updated);
                                setSupportEmails(prev => prev.map(em => em.id === selectedEmail.id ? updated : em));
                              }}
                              className="mt-1 min-h-[300px] font-mono text-sm"
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <button
                              onClick={handleToggleTemplate}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {selectedEmail.saveAsTemplate ? (
                                <CheckSquare className="h-4 w-4 text-indigo-600" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                              Save as Template
                            </button>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-white/10">
                            <Button
                              onClick={handleCopyToClipboard}
                              variant="outline"
                              className="flex-1"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </Button>
                            <Button
                              onClick={handleSendReply}
                              disabled={isSending || selectedEmail.status === 'sent'}
                              className="flex-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 hover:opacity-90"
                            >
                              {isSending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="mr-2 h-4 w-4" />
                                  Send Reply
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <GlassCard className="p-12 text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select an Email</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an email from the list to view details and generate a reply
                </p>
              </GlassCard>
            )}
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
                      : selectedEmail?.aiReply
                      ? 'Reply generated! Review and customize as needed.'
                      : selectedEmail
                      ? 'Ready to generate an AI reply for this email.'
                      : 'Select an email to get started.'}
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
