export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Work' | 'Personal' | 'Urgent' | 'Health' | 'Finance';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: number;
}
