'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { getAdmins, createAdmin, type Admin } from '@/lib/api/admin';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Shield, Loader2 } from 'lucide-react';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdmins();
      setAdmins(data);
    } catch (error: any) {
      console.error('Failed to load admins:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load admins';
      toast.error(errorMessage);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsCreating(true);
    try {
      await createAdmin(name, email, password);
      toast.success('Admin created successfully');
      setCreateDialogOpen(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      // Reload admins
      await loadAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
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

      <div className="relative z-10 px-4 sm:px-6 pb-24 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                Admin Management
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                Manage administrator accounts
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <AnimatedButton glow className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Admin
                </AnimatedButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                    Create New Admin
                  </DialogTitle>
                  <DialogDescription>
                    Add a new administrator account to the system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Admin User"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isCreating}
                      className="bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isCreating}
                      className="bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isCreating}
                      className="bg-white/50 dark:bg-white/5 backdrop-blur-sm"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <AnimatedButton
                      type="submit"
                      disabled={isCreating || !name || !email || !password}
                      className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Admin'
                      )}
                    </AnimatedButton>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          <GlassCard delay={0.1}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">
                  Administrators
                </CardTitle>
                <CardDescription>
                  List of all administrator accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No admins found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-4 font-semibold">Name</th>
                          <th className="text-left p-4 font-semibold">Email</th>
                          <th className="text-left p-4 font-semibold">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin, index) => (
                          <motion.tr
                            key={admin.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/10 hover:bg-white/10 dark:hover:bg-white/5"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                {admin.name}
                              </div>
                            </td>
                            <td className="p-4">{admin.email}</td>
                            <td className="p-4">
                              {new Date(admin.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}












