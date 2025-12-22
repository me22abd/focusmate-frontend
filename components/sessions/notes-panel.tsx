/**
 * ============================================================================
 * COMPONENTS/SESSIONS/NOTES-PANEL.TSX - NOTES PANEL
 * ============================================================================
 * 
 * Purpose: Notes management with module grouping, create/edit UI.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Edit, Trash2, BookOpen, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { getMyNotes, createNote, type Note } from '@/lib/api/notes';
import { getModules, type Module } from '@/lib/api/modules';
import { cn } from '@/lib/utils';

export function NotesPanel() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [filter, setFilter] = useState<'all' | 'module' | 'recent'>('all');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const [notesData, modulesData] = await Promise.all([
        getMyNotes(),
        getModules(),
      ]);
      setNotes(notesData);
      setModules(modulesData);
    } catch (error) {
      console.error('Failed to fetch:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (filter === 'recent') {
      const noteDate = new Date(note.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return noteDate >= weekAgo;
    }
    if (filter === 'module' && selectedModule) {
      // Note: Need to add moduleId to Note entity for proper filtering
      return true; // Placeholder
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Notes
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'module', 'recent'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap',
              filter === f
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No notes yet
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Create your first note to get started
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <FileText className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingNote(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {(showAddDialog || editingNote) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {editingNote ? 'Edit Note' : 'Add Note'}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const content = formData.get('content') as string;
                  
                  try {
                    if (editingNote) {
                      // Update logic - would need updateNote API
                      toast.info('Update functionality coming soon');
                    } else {
                      await createNote(null, content);
                      toast.success('Note created');
                      setShowAddDialog(false);
                      fetchData();
                    }
                  } catch (error) {
                    toast.error('Failed to save note');
                  }
                }}
                className="space-y-4"
              >
                <textarea
                  name="content"
                  placeholder="Write your note..."
                  defaultValue={editingNote?.content || ''}
                  required
                  rows={10}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingNote ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddDialog(false);
                      setEditingNote(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

