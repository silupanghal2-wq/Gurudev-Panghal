/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Filter, 
  Clock, 
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Settings2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Task, Priority, Category } from './types';
import { CATEGORIES, INITIAL_TASKS } from './constants';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Completed'>('All');
  const [isAdding, setIsAdding] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'Work' as Category
  });

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({ title: '', description: '', priority: 'medium', category: 'Work' });
    setIsAdding(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || 
                           (filterStatus === 'Active' && !task.completed) || 
                           (filterStatus === 'Completed' && task.completed);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tasks, searchQuery, filterCategory, filterStatus]);

  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    };
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Sidebar - Desktop Only */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-[#E5E7EB] bg-white lg:block">
        <div className="p-8">
          <div className="flex items-center gap-3 font-bold tracking-tight text-xl mb-12">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-1 bg-white rounded-full"></div>
            </div>
            TaskFlow
          </div>

          <nav className="space-y-1">
            <NavItem icon={<LayoutGrid size={18} />} label="Dashboard" active />
            <NavItem icon={<Calendar size={18} />} label="Calendar" />
            <NavItem icon={<ListIcon size={18} />} label="My Tasks" />
            <NavItem icon={<Settings2 size={18} />} label="Settings" />
          </nav>

          <div className="mt-12">
            <div className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 mb-4 px-3">Categories</div>
            <div className="space-y-1">
              {['All', ...CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat as any)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm flex items-center justify-between group ${
                    filterCategory === cat ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                  id={`cat-filter-${cat}`}
                >
                  {cat}
                  <span className={`text-[10px] font-mono ${filterCategory === cat ? 'opacity-60' : 'opacity-30 group-hover:opacity-50'}`}>
                    {cat === 'All' ? tasks.length : tasks.filter(t => t.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 md:p-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[3px] opacity-50 mb-2">Systems Management</div>
              <h1 className="text-4xl font-bold tracking-tight">Project Overview</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                ))}
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/10"
                id="add-task-trigger"
              >
                <Plus size={18} /> New Task
              </button>
            </div>
          </header>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatCard label="Total Operations" value={stats.total} />
            <StatCard label="Live Units" value={stats.pending} />
            <StatCard label="Success Rate" value={`${stats.completionRate}%`} />
            <StatCard label="Uptime" value="99.9%" />
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input
                type="text"
                placeholder="Query system database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E7EB] rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
                id="search-input"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm outline-none cursor-pointer focus:border-black transition-all appearance-none pr-10 relative"
                id="status-select"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={() => toggleTask(task.id)} 
                    onDelete={() => deleteTask(task.id)} 
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative z-10"
              id="add-task-modal"
            >
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Initiate New Task</h2>
              <form onSubmit={addTask} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 px-1">Label</label>
                  <input
                    autoFocus
                    placeholder="E.g. Database migration"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-black/5"
                    id="new-task-title"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 px-1">Context</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the objective..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    id="new-task-desc"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 px-1">Priority</label>
                    <div className="relative">
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                        className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 outline-none appearance-none cursor-pointer"
                        id="new-task-priority"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 px-1">Sector</label>
                    <div className="relative">
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Category })}
                        className="w-full bg-[#F3F4F6] border-none rounded-xl p-4 outline-none appearance-none cursor-pointer"
                        id="new-task-category"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-gray-100 py-4 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-2 bg-black text-white py-4 rounded-xl font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    id="confirm-add-task"
                  >
                    Confirm Protocol
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
      active ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-white border border-[#E5E7EB] p-6 rounded-3xl group hover:border-black transition-colors">
      <div className="text-[10px] font-mono uppercase tracking-[2px] opacity-40 mb-2 truncate group-hover:opacity-60">{label}</div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

const TaskItem: React.FC<{
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ task, onToggle, onDelete }) => {
  const priorityColor = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-rose-500'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group bg-white border border-[#E5E7EB] p-4 rounded-2xl flex items-start gap-4 transition-all ${
        task.completed ? 'opacity-50' : 'hover:border-black/20 hover:shadow-sm'
      }`}
      id={`task-item-${task.id}`}
    >
      <button 
        onClick={onToggle}
        className={`mt-1 flex-shrink-0 transition-all ${task.completed ? 'text-emerald-500' : 'text-gray-300 hover:text-black'}`}
        id={`toggle-task-${task.id}`}
      >
        {task.completed ? <CheckCircle2 size={22} fill="currentColor" className="text-emerald-500 [&>circle]:fill-white" /> : <Circle size={22} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityColor[task.priority]}`}></div>
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">{task.category}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">/</span>
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">{new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}</span>
        </div>
        <h3 className={`font-semibold text-lg leading-tight truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{task.description}</p>
        )}
      </div>

      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition-all"
        id={`delete-task-${task.id}`}
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
};

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-20 flex flex-col items-center justify-center text-center opacity-40"
    >
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <Filter className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-medium mb-2">No results matching protocol</h3>
      <p className="text-sm">Adjust filters or create a new system entry.</p>
    </motion.div>
  );
}
