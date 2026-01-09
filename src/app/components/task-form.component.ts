import { Component, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';

@Component({
    selector: 'app-task-form',
    imports: [FormsModule],
    template: `
    <div class="form-container">
      @if (!showForm()) {
        <button class="add-task-btn" (click)="toggleForm()">
          <span class="plus-icon">✨</span>
          Create Magic Task
        </button>
      }
    
      @if (showForm()) {
        <form (ngSubmit)="onSubmit()" class="task-form">
          <div class="form-header">
            <h3>🚀 New Mission</h3>
            <button type="button" class="close-btn" (click)="toggleForm()">✕</button>
          </div>
          <div class="form-group">
            <label for="title">Task Title *</label>
            <input
              type="text"
              id="title"
              [(ngModel)]="title"
              name="title"
              placeholder="Enter task title"
              required
              />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              [(ngModel)]="description"
              name="description"
              placeholder="Enter task description"
              rows="3"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="priority">Priority</label>
              <select id="priority" [(ngModel)]="priority" name="priority">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status" [(ngModel)]="status" name="status">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              [(ngModel)]="dueDate"
              name="dueDate"
              />
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" (click)="resetForm()">
              Cancel
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="!title || isSubmitting()"
              >
              {{ isSubmitting() ? 'Creating...' : 'Create Task' }}
            </button>
          </div>
        </form>
      }
    </div>
    `,
    styles: [`
    .form-container {
      margin-bottom: 40px;
    }

    .add-task-btn {
      width: 100%;
      padding: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
      background-size: 200% auto;
      color: white;
      border: none;
      border-radius: 20px;
      font-size: 18px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .add-task-btn:hover {
      background-position: right center;
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
    }

    .plus-icon {
      font-size: 24px;
    }

    .task-form {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
      animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    @keyframes zoomIn {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .form-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .close-btn {
      background: #f1f5f9;
      border: none;
      color: #64748b;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #fee2e2;
      color: #ef4444;
      transform: rotate(90deg);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      color: #475569;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 14px;
      font-size: 15px;
      transition: all 0.3s;
      font-family: inherit;
      background: white;
      color: #1e293b;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      background: white;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      margin-top: 32px;
    }

    .cancel-btn,
    .submit-btn {
      flex: 1;
      padding: 16px;
      border: none;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn {
      background: #f1f5f9;
      color: #64748b;
    }

    .cancel-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }

    .submit-btn {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskFormComponent {
  showForm = signal(false);
  isSubmitting = signal(false);
  
  // Form fields
  title = '';
  description = '';
  status: 'pending' | 'in_progress' | 'completed' = 'pending';
  priority: 'low' | 'medium' | 'high' = 'medium';
  dueDate = '';

  constructor(private taskService: TaskService) {}

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.title || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const taskToCreate = {
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      due_date: this.dueDate ? new Date(this.dueDate).toISOString() : null
    };

    const result = await this.taskService.createTask(taskToCreate);
    
    if (result) {
      this.resetForm();
    }
    
    this.isSubmitting.set(false);
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.status = 'pending';
    this.priority = 'medium';
    this.dueDate = '';
    this.showForm.set(false);
  }
}