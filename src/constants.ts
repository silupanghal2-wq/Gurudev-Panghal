import { Category } from './types';

export const CATEGORIES: Category[] = ['Work', 'Personal', 'Urgent', 'Health', 'Finance'];

export const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Review project architecture',
    description: 'Ensure the new system design meets requirements.',
    priority: 'high',
    category: 'Work',
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'Daily exercise',
    description: '30-minute cardio session.',
    priority: 'medium',
    category: 'Health',
    completed: true,
    createdAt: Date.now() - 86400000,
  }
];
