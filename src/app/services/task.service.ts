import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Signal to store tasks
  private tasksSignal = signal<Task[]>([]);
  
  // Public readonly signal
  tasks = this.tasksSignal.asReadonly();
  
  // Computed signals for derived state
  pendingTasks = computed(() => 
    this.tasksSignal().filter(t => t.status === 'pending')
  );
  
  inProgressTasks = computed(() => 
    this.tasksSignal().filter(t => t.status === 'in_progress')
  );
  
  completedTasks = computed(() => 
    this.tasksSignal().filter(t => t.status === 'completed')
  );

  constructor(private supabaseService: SupabaseService) {
    this.loadTasks();
  }

  async loadTasks(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Update signal - this automatically triggers change detection
      this.tasksSignal.set(data as Task[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;   
      // Add new task to signal
      this.tasksSignal.update(tasks => [data as Task, ...tasks]);
      
      return data as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Update task in signal
      this.tasksSignal.update(tasks => 
        tasks.map(t => t.id === id ? data as Task : t)
      );
      
      return data as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService
        .getClient()
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove task from signal
      this.tasksSignal.update(tasks => tasks.filter(t => t.id !== id));
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }
}