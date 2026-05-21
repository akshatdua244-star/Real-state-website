// ===========================
// TODO APP - MAIN APPLICATION
// ===========================

class TodoApp {
  constructor() {
    this.tasks = [];
    this.editingId = null;
    this.currentFilter = 'all';
    this.currentSort = 'date-newest';
    this.currentPriority = 'all';

    this.initializeElements();
    this.loadTasks();
    this.setupEventListeners();
    this.render();
    this.updateDate();
  }

  // Initialize DOM elements
  initializeElements() {
    this.taskInput = document.getElementById('task-input');
    this.addBtn = document.getElementById('add-btn');
    this.tasksList = document.getElementById('tasks-list');
    this.emptyState = document.getElementById('empty-state');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.sortBtn = document.getElementById('sort-btn');
    this.sortMenu = document.getElementById('sort-menu');
    this.sortMenuBtns = this.sortMenu.querySelectorAll('button');
    this.prioritySelect = document.getElementById('priority-select');
    this.clearCompletedBtn = document.getElementById('clear-completed-btn');
    this.clearAllBtn = document.getElementById('clear-all-btn');
    this.totalTasksEl = document.getElementById('total-tasks');
    this.completedTasksEl = document.getElementById('completed-tasks');
    this.pendingTasksEl = document.getElementById('pending-tasks');
    this.modal = document.getElementById('edit-modal');
    this.editInput = document.getElementById('edit-input');
    this.editPriority = document.getElementById('edit-priority');
    this.closeModalBtn = document.getElementById('close-modal');
    this.cancelBtn = document.getElementById('cancel-btn');
    this.saveBtn = document.getElementById('save-btn');
    this.toast = document.getElementById('toast');
  }

  // Setup event listeners
  setupEventListeners() {
    // Add task
    this.addBtn.addEventListener('click', () => this.addTask());
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTask();
    });

    // Filter
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => this.setFilter(e.target.closest('button').dataset.filter));
    });

    // Sort
    this.sortBtn.addEventListener('click', () => this.toggleSortMenu());
    this.sortMenuBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setSort(e.target.dataset.sort);
        this.toggleSortMenu();
      });
    });

    // Priority filter
    this.prioritySelect.addEventListener('change', (e) => {
      this.currentPriority = e.target.value;
      this.render();
    });

    // Clear buttons
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    this.clearAllBtn.addEventListener('click', () => this.clearAll());

    // Modal
    this.closeModalBtn.addEventListener('click', () => this.closeModal());
    this.cancelBtn.addEventListener('click', () => this.closeModal());
    this.saveBtn.addEventListener('click', () => this.saveEdit());

    // Close modal on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Close sort menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.sort-container')) {
        this.sortMenu.classList.add('hidden');
      }
    });
  }

  // Add new task
  addTask() {
    const text = this.taskInput.value.trim();
    if (!text) {
      this.showToast('Please enter a task', 'warning');
      return;
    }

    const task = {
      id: Date.now(),
      text,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.render();
    this.taskInput.value = '';
    this.taskInput.focus();
    this.showToast('Task added successfully!', 'success');
  }

  // Toggle task completion
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
      this.showToast(task.completed ? 'Task completed!' : 'Task marked as pending', 'success');
    }
  }

  // Delete task
  deleteTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.saveTasks();
      this.render();
      this.showToast('Task deleted', 'success');
    }
  }

  // Open edit modal
  openEditModal(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      this.editingId = id;
      this.editInput.value = task.text;
      this.editPriority.value = task.priority;
      this.modal.classList.remove('hidden');
      this.editInput.focus();
    }
  }

  // Save edited task
  saveEdit() {
    const text = this.editInput.value.trim();
    if (!text) {
      this.showToast('Task description cannot be empty', 'warning');
      return;
    }

    const task = this.tasks.find(t => t.id === this.editingId);
    if (task) {
      task.text = text;
      task.priority = this.editPriority.value;
      this.saveTasks();
      this.render();
      this.closeModal();
      this.showToast('Task updated successfully!', 'success');
    }
  }

  // Close edit modal
  closeModal() {
    this.modal.classList.add('hidden');
    this.editingId = null;
    this.editInput.value = '';
  }

  // Set filter
  setFilter(filter) {
    this.currentFilter = filter;
    this.filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    this.render();
  }

  // Toggle sort menu
  toggleSortMenu() {
    this.sortMenu.classList.toggle('hidden');
  }

  // Set sort
  setSort(sort) {
    this.currentSort = sort;
    this.render();
  }

  // Filter tasks
  getFilteredTasks() {
    let filtered = this.tasks;

    // Filter by status
    if (this.currentFilter === 'active') {
      filtered = filtered.filter(t => !t.completed);
    } else if (this.currentFilter === 'completed') {
      filtered = filtered.filter(t => t.completed);
    }

    // Filter by priority
    if (this.currentPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === this.currentPriority);
    }

    return filtered;
  }

  // Sort tasks
  sortTasks(tasks) {
    const sorted = [...tasks];

    switch (this.currentSort) {
      case 'date-newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      case 'date-oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      case 'alphabetical':
        return sorted.sort((a, b) => a.text.localeCompare(b.text));

      default:
        return sorted;
    }
  }

  // Clear completed tasks
  clearCompleted() {
    const completedCount = this.tasks.filter(t => t.completed).length;
    if (completedCount === 0) {
      this.showToast('No completed tasks to clear', 'warning');
      return;
    }

    if (confirm(`Delete ${completedCount} completed task(s)?`)) {
      this.tasks = this.tasks.filter(t => !t.completed);
      this.saveTasks();
      this.render();
      this.showToast(`Cleared ${completedCount} completed task(s)`, 'success');
    }
  }

  // Clear all tasks
  clearAll() {
    if (this.tasks.length === 0) {
      this.showToast('No tasks to clear', 'warning');
      return;
    }

    if (confirm(`Delete all ${this.tasks.length} task(s)? This cannot be undone.`)) {
      this.tasks = [];
      this.saveTasks();
      this.render();
      this.showToast('All tasks cleared', 'success');
    }
  }

  // Update stats
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;

    this.totalTasksEl.textContent = total;
    this.completedTasksEl.textContent = completed;
    this.pendingTasksEl.textContent = pending;
  }

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Create task element
  createTaskElement(task) {
    const li = document.createElement('div');
    li.className = `task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority`;

    li.innerHTML = `
      <input
        type="checkbox"
        class="task-checkbox"
        ${task.completed ? 'checked' : ''}
        data-id="${task.id}"
      >
      <div class="task-content">
        <div class="task-text">${this.escapeHtml(task.text)}</div>
        <div class="task-meta">
          <span class="task-date">
            <i class="far fa-calendar"></i>
            ${this.formatDate(task.createdAt)}
          </span>
          <span class="task-priority ${task.priority}">
            ${task.priority}
          </span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-btn edit-btn" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="task-btn delete-btn" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Event listeners
    const checkbox = li.querySelector('.task-checkbox');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');

    checkbox.addEventListener('change', () => this.toggleTask(task.id));
    editBtn.addEventListener('click', () => this.openEditModal(task.id));
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this task?')) {
        this.deleteTask(task.id);
      }
    });

    return li;
  }

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render tasks
  render() {
    const filteredTasks = this.getFilteredTasks();
    const sortedTasks = this.sortTasks(filteredTasks);

    this.tasksList.innerHTML = '';

    if (sortedTasks.length === 0) {
      this.emptyState.style.display = 'flex';
    } else {
      this.emptyState.style.display = 'none';
      sortedTasks.forEach(task => {
        this.tasksList.appendChild(this.createTaskElement(task));
      });
    }

    this.updateStats();
  }

  // Show toast notification
  showToast(message, type = 'info') {
    this.toast.textContent = message;
    this.toast.className = `toast show ${type}`;

    setTimeout(() => {
      this.toast.classList.remove('show');
    }, 3000);
  }

  // Update current date
  updateDate() {
    const dateDisplay = document.getElementById('date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    dateDisplay.textContent = today;
  }

  // Save tasks to localStorage
  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  // Load tasks from localStorage
  loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      try {
        this.tasks = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading tasks:', e);
        this.tasks = [];
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
