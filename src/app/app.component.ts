import { Component, computed, Inject, inject, signal } from '@angular/core';

import { TaskFormComponent } from './components/task-form.component';
import { TaskCardComponent } from './components/task-card.component';
import { TaskService } from './services/task.service';

@Component({
    selector: 'app-root',
    imports: [TaskFormComponent, TaskCardComponent],
    template: `
    <div class="app-container">
      <div class="circles">
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
      </div>
      <header class="app-header">
        <h1>📋 Task Manager</h1>
        <p class="subtitle">Organize your tasks efficiently</p>
      </header>
    
      <main class="main-content">
        <!-- Task Form Component -->
        <app-task-form></app-task-form>
    
        <!-- Task Statistics -->
        <div class="stats-container">
          <div class="stat-card total">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-value">{{ totalTasks() }}</div>
              <div class="stat-label">Total Tasks</div>
            </div>
          </div>
          <div class="stat-card pending">
            <div class="stat-icon">⏳</div>
            <div class="stat-info">
              <div class="stat-value">{{ pendingCount() }}</div>
              <div class="stat-label">Pending</div>
            </div>
          </div>
          <div class="stat-card progress">
            <div class="stat-icon">🚀</div>
            <div class="stat-info">
              <div class="stat-value">{{ inProgressCount() }}</div>
              <div class="stat-label">In Progress</div>
            </div>
          </div>
          <div class="stat-card completed">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <div class="stat-value">{{ completedCount() }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>
        </div>
    
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'all'"
            (click)="setFilter('all')"
            >
            All ({{ totalTasks() }})
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'pending'"
            (click)="setFilter('pending')"
            >
            Pending ({{ pendingCount() }})
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'in_progress'"
            (click)="setFilter('in_progress')"
            >
            In Progress ({{ inProgressCount() }})
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'completed'"
            (click)="setFilter('completed')"
            >
            Completed ({{ completedCount() }})
          </button>
        </div>
    
        <!-- Tasks Grid -->
        @if (filteredTasks().length > 0) {
          <div class="tasks-grid">
            @for (task of filteredTasks(); track trackByTaskId($index, task)) {
              <app-task-card
                [taskInput]="task"
              ></app-task-card>
            }
          </div>
        } @else {
          <div class="no-tasks">
            <div class="no-tasks-icon">📝</div>
            <h3>No tasks found</h3>
            <p>{{ getEmptyMessage() }}</p>
          </div>
        }
    
      </main>
    </div>
    `,
    styles: [`
    .app-container {
      position: relative;
      min-height: 100vh;
      padding: 40px 24px;
      overflow: hidden;
    }

    /* Background Circles Animation */
    .circles {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
      pointer-events: none;
    }

    .circles li {
      position: absolute;
      display: block;
      list-style: none;
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      animation: animate 25s linear infinite;
      bottom: -150px;
      border-radius: 50%;
    }

    .circles li:nth-child(1) { left: 25%; width: 80px; height: 80px; animation-delay: 0s; }
    .circles li:nth-child(2) { left: 10%; width: 20px; height: 20px; animation-delay: 2s; animation-duration: 12s; }
    .circles li:nth-child(3) { left: 70%; width: 20px; height: 20px; animation-delay: 4s; }
    .circles li:nth-child(4) { left: 40%; width: 60px; height: 60px; animation-delay: 0s; animation-duration: 18s; }
    .circles li:nth-child(5) { left: 65%; width: 20px; height: 20px; animation-delay: 0s; }
    .circles li:nth-child(6) { left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
    .circles li:nth-child(7) { left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
    .circles li:nth-child(8) { left: 50%; width: 25px; height: 25px; animation-delay: 15s; animation-duration: 45s; }
    .circles li:nth-child(9) { left: 20%; width: 15px; height: 15px; animation-delay: 2s; animation-duration: 35s; }
    .circles li:nth-child(10) { left: 85%; width: 150px; height: 150px; animation-delay: 0s; animation-duration: 11s; }

    @keyframes animate {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; border-radius: 0; }
      100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
    }

    .app-header {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .app-header h1 {
      font-size: 56px;
      margin: 0 0 12px 0;
      font-weight: 800;
      letter-spacing: -1px;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .subtitle {
      font-size: 20px;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }

    .main-content {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 40px;
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .stat-card.total .stat-value { color: #6366f1; }
    .stat-card.pending .stat-value { color: #f59e0b; }
    .stat-card.progress .stat-value { color: #8b5cf6; }
    .stat-card.completed .stat-value { color: #10b981; }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      background: rgba(255, 255, 255, 0.2);
      padding: 8px;
      border-radius: 16px;
      backdrop-filter: blur(5px);
    }

    .filter-tab {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      background: transparent;
      color: white;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-tab:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .filter-tab.active {
      background: white;
      color: #6366f1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .tasks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      animation: fadeIn 0.5s ease;
    }

    .no-tasks {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .no-tasks-icon {
      font-size: 64px;
      margin-bottom: 16px;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .no-tasks h3 {
      color: #1F2937;
      margin: 0 0 8px 0;
      font-size: 24px;
    }

    .no-tasks p {
      color: #6B7280;
      margin: 0;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 16px;
      }

      .app-header h1 {
        font-size: 32px;
      }

      .subtitle {
        font-size: 16px;
      }

      .tasks-grid {
        grid-template-columns: 1fr;
      }

      .filter-tabs {
        flex-direction: column;
      }

      .filter-tab {
        width: 100%;
      }

      .stats-container {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class AppComponent {
  // Use signal for active filter
  activeFilter = signal<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Access tasks from service
  tasks = this.taskService.tasks;
  pendingTasks = this.taskService.pendingTasks;
  inProgressTasks = this.taskService.inProgressTasks;
  completedTasks = this.taskService.completedTasks;

  // Computed values for statistics
  totalTasks = computed(() => this.tasks().length);
  pendingCount = computed(() => this.pendingTasks().length);
  inProgressCount = computed(() => this.inProgressTasks().length);
  completedCount = computed(() => this.completedTasks().length);

  // Computed filtered tasks based on active filter
  filteredTasks = computed(() => {
    switch (this.activeFilter()) {
      case 'pending':
        return this.pendingTasks();
      case 'in_progress':
        return this.inProgressTasks();
      case 'completed':
        return this.completedTasks();
      default:
        return this.tasks();
    }
  });

//   private taskService =new Inject(TaskService);
  constructor(private taskService: TaskService) {}

  setFilter(filter: 'all' | 'pending' | 'in_progress' | 'completed'): void {
    this.activeFilter.set(filter);
  }

  getEmptyMessage(): string {
    switch (this.activeFilter()) {
      case 'pending':
        return 'No pending tasks. Great job!';
      case 'in_progress':
        return 'No tasks in progress. Start working on something!';
      case 'completed':
        return 'No completed tasks yet. Keep going!';
      default:
        return 'Create your first task to get started!';
    }
  }

  trackByTaskId(index: number, task: any): string {
    return task.id;
  }
}