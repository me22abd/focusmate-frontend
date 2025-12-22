/**
 * ============================================================================
 * COMPONENTS/SESSIONS/MODULES-PANEL.TSX - MODULES PANEL
 * ============================================================================
 * 
 * Purpose: Module manager for courses, topics, resources. Expandable cards
 * showing tasks, notes, and flashcards grouped by module.
 * 
 * 📘 CODE ORIGIN: Custom module management panel with full CRUD.
 * 
 * @author Marvelous Eromonsele
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Link as LinkIcon,
  FileText,
  CheckSquare,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getModules, createModule, updateModule, deleteModule, type Module } from '@/lib/api/modules';
import { getTasks } from '@/lib/api/tasks';

export function ModulesPanel() {
  const { user } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchModules();
    }
  }, [user?.id]);

  const fetchModules = async () => {
    try {
      const data = await getModules();
      setModules(data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedModules(newSet);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this module?')) return;
    try {
      await deleteModule(id);
      toast.success('Module deleted');
      fetchModules();
    } catch (error) {
      toast.error('Failed to delete module');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Your Modules
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {modules.length} module{modules.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No modules yet
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Create your first module to organize your courses
          </p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Module
          </Button>
        </Card>
      ) : (
        modules.map((module, index) => {
          const isExpanded = expandedModules.has(module.id);
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-2 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: module.color || '#6366f1' }}
                      >
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {module.name}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {module.lecturer && `${module.lecturer} • `}
                          {module.level || module.year || 'No level'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModule(module);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(module.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModule(module.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800"
                      >
                        <div className="space-y-4">
                          {/* Resources */}
                          {module.resources && module.resources.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Resources
                              </h5>
                              <div className="space-y-2">
                                {module.resources.map((resource: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                                  >
                                    {resource.type === 'link' ? (
                                      <LinkIcon className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-green-500" />
                                    )}
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                      {resource.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Placeholder for tasks, notes, flashcards */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <CheckSquare className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                              <p className="text-xs text-slate-600 dark:text-slate-400">Tasks</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <FileText className="h-5 w-5 mx-auto mb-1 text-green-500" />
                              <p className="text-xs text-slate-600 dark:text-slate-400">Notes</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <Brain className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                              <p className="text-xs text-slate-600 dark:text-slate-400">Flashcards</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}

      {/* Simple Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Add Module</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  try {
                    await createModule({
                      name: formData.get('name') as string,
                      color: formData.get('color') as string || '#6366f1',
                      lecturer: formData.get('lecturer') as string || undefined,
                      level: formData.get('level') as string || undefined,
                    });
                    toast.success('Module created');
                    setShowAddDialog(false);
                    fetchModules();
                  } catch (error) {
                    toast.error('Failed to create module');
                  }
                }}
                className="space-y-4"
              >
                <input
                  name="name"
                  placeholder="Module name"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  name="lecturer"
                  placeholder="Lecturer (optional)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  name="level"
                  placeholder="Level/Year (optional)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  name="color"
                  type="color"
                  defaultValue="#6366f1"
                  className="w-full h-10"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
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

