import { Component, Input, signal } from '@angular/core';

import { Task } from '../models/task.model';
import { TaskService } from '../services/task.service';

@Component({
    selector: 'app-task-card',
    imports: [],
    template: `
    <div class="task-card" [class]="'status-' + task().status" [class.expanded]="!isCollapsed()">
      <div class="task-header">
        <div class="task-title-section">
          <div class="status-indicator"></div>
          <h3 class="task-title">{{ task().title }}</h3>
          <span class="priority-badge" [class]="'priority-' + task().priority">
            {{ task().priority }}
          </span>
        </div>
        <div class="actions">
          @if (task().description) {
            <button
              class="collapse-btn"
              (click)="toggleCollapse()"
              [title]="isCollapsed() ? 'Show Details' : 'Hide Details'"
              >
              {{ isCollapsed() ? '📂' : '📖' }}
            </button>
          }
          <button
            class="delete-btn"
            (click)="onDelete()"
            [disabled]="isDeleting()"
            title="Delete task"
            >
            <span class="delete-icon">{{ isDeleting() ? '⌛' : '🗑️' }}</span>
          </button>
        </div>
      </div>
    
      <div class="collapsible-content" [class.show]="!isCollapsed()">
        @if (task().description) {
          <p class="task-description">
            {{ task().description }}
          </p>
        }
    
        <div class="task-footer">
          <div class="status-picker">
            <label class="footer-label">Status</label>
            <select
              class="status-select"
              [value]="task().status"
              (change)="onStatusChange($event)"
              [disabled]="isUpdating()"
              >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
    
          @if (task().due_date) {
            <div class="due-date">
              <span class="date-icon">📅</span>
              <div class="date-info">
                <span class="footer-label">Due Date</span>
                <span class="date-value">{{ formatDate(task().due_date) }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
    `,
    styles: [`
    .task-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
      overflow: hidden;
      border: 1px solid #f1f5f9;
      animation: slideInUp 0.5s ease backwards;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .task-card:hover {
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
      transform: translateY(-8px);
    }

    .collapsible-content {
      max-height: 0;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0, 1, 0, 1);
      opacity: 0;
    }

    .collapsible-content.show {
      max-height: 1000px;
      transition: all 0.5s cubic-bezier(1, 0, 1, 0);
      opacity: 1;
      padding-top: 10px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .collapse-btn {
      background: #f1f5f9;
      border: none;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: all 0.2s;
      font-size: 18px;
    }

    .collapse-btn:hover {
      background: #e2e8f0;
      transform: scale(1.1);
    }

    /* Status Colors */
    .status-pending { border-left: 6px solid #f59e0b; }
    .status-in_progress { border-left: 6px solid #8b5cf6; }
    .status-completed { 
      border-left: 6px solid #10b981;
      background: #f8fafc;
    }

    .status-completed .task-title {
      text-decoration: line-through;
      color: #94a3b8;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-pending .status-indicator { background: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }
    .status-in_progress .status-indicator { 
      background: #8b5cf6; 
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
      animation: pulse 2s infinite;
    }
    .status-completed .status-indicator { background: #10b981; }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .task-title-section {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      flex: 1;
    }

    .task-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.5px;
    }

    .priority-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-high { background: #fee2e2; color: #ef4444; }
    .priority-medium { background: #fef3c7; color: #f59e0b; }
    .priority-low { background: #dcfce7; color: #10b981; }

    .delete-btn {
      background: #f1f5f9;
      border: none;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      transition: all 0.2s;
      margin-left: 12px;
    }

    .delete-btn:hover:not(:disabled) {
      background: #fee2e2;
      transform: rotate(15deg);
    }

    .delete-icon { font-size: 18px; }

    .task-description {
      color: #64748b;
      margin: 0 0 20px 0;
      line-height: 1.6;
      font-size: 15px;
    }

    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      border-top: 1px dashed #e2e8f0;
    }

    .footer-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .status-select {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      background: #f8fafc;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
    }

    .status-select:hover:not(:disabled) {
      border-color: #6366f1;
      background: white;
    }

    .due-date {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: right;
    }

    .date-icon { font-size: 24px; }
    .date-value {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) set taskInput(value: Task) {
    this.task.set(value);
  }

  task = signal<Task>({} as Task);
  isUpdating = signal(false);
  isDeleting = signal(false);
  isCollapsed = signal(true);

  constructor(private taskService: TaskService) {}

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  async onStatusChange(event: Event): Promise<void> {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as Task['status'];
    
    if (!this.task().id || this.isUpdating()) return;

    this.isUpdating.set(true);
    
    await this.taskService.updateTask(this.task().id!, { status: newStatus });
    
    this.isUpdating.set(false);
  }

  async onDelete(): Promise<void> {
    if (!this.task().id || this.isDeleting()) return;

    if (!confirm('Are you sure you want to delete this task?')) return;

    this.isDeleting.set(true);
    
    await this.taskService.deleteTask(this.task().id!);
    
    this.isDeleting.set(false);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) {
      return 'No due date';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }
}