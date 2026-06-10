// LocalStorage Manager
class TodoStorage {
    constructor(key = 'todos') {
        this.key = key;
    }

    getTodos() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : [];
    }

    saveTodos(todos) {
        localStorage.setItem(this.key, JSON.stringify(todos));
    }

    addTodo(todo) {
        const todos = this.getTodos();
        todos.push({
            id: Date.now(),
            text: todo.text,
            completed: false,
            priority: todo.priority || 'low',
            createdAt: new Date().toLocaleDateString()
        });
        this.saveTodos(todos);
        return todos[todos.length - 1];
    }

    updateTodo(id, updates) {
        let todos = this.getTodos();
        todos = todos.map(todo => 
            todo.id === id ? { ...todo, ...updates } : todo
        );
        this.saveTodos(todos);
    }

    deleteTodo(id) {
        let todos = this.getTodos();
        todos = todos.filter(todo => todo.id !== id);
        this.saveTodos(todos);
    }

    clearCompleted() {
        let todos = this.getTodos();
        todos = todos.filter(todo => !todo.completed);
        this.saveTodos(todos);
    }

    deleteAll() {
        localStorage.removeItem(this.key);
    }
}

// Todo App
class TodoApp {
    constructor() {
        this.storage = new TodoStorage();
        this.currentFilter = 'all';
        this.editingId = null;

        this.elements = {
            input: document.getElementById('todoInput'),
            addBtn: document.getElementById('addBtn'),
            todoList: document.getElementById('todoList'),
            emptyState: document.getElementById('emptyState'),
            filterBtns: document.querySelectorAll('.filter-btn'),
            clearCompleted: document.getElementById('clearCompleted'),
            deleteAll: document.getElementById('deleteAll'),
            totalTasks: document.getElementById('totalTasks'),
            activeTasks: document.getElementById('activeTasks'),
            completedTasks: document.getElementById('completedTasks'),
        };

        this.init();
    }

    init() {
        this.attachEventListeners();
        this.render();
    }

    attachEventListeners() {
        this.elements.addBtn.addEventListener('click', () => this.addTodo());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });

        this.elements.clearCompleted.addEventListener('click', () => {
            if (confirm('Clear all completed tasks?')) {
                this.storage.clearCompleted();
                this.render();
            }
        });

        this.elements.deleteAll.addEventListener('click', () => {
            if (confirm('Delete ALL tasks? This cannot be undone!')) {
                this.storage.deleteAll();
                this.render();
            }
        });
    }

    addTodo() {
        const text = this.elements.input.value.trim();
        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        if (text.length > 200) {
            alert('Task is too long (max 200 characters)');
            return;
        }

        this.storage.addTodo({ text, priority: 'low' });
        this.elements.input.value = '';
        this.render();
    }

    deleteTodo(id) {
        if (confirm('Delete this task?')) {
            this.storage.deleteTodo(id);
            this.render();
        }
    }

    toggleTodo(id) {
        const todos = this.storage.getTodos();
        const todo = todos.find(t => t.id === id);
        if (todo) {
            this.storage.updateTodo(id, { completed: !todo.completed });
            this.render();
        }
    }

    editTodo(id) {
        const todos = this.storage.getTodos();
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText !== null && newText.trim() !== '') {
            this.storage.updateTodo(id, { text: newText.trim() });
            this.render();
        }
    }

    updateFilterButtons() {
        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    getFilteredTodos() {
        const todos = this.storage.getTodos();
        switch (this.currentFilter) {
            case 'active':
                return todos.filter(t => !t.completed);
            case 'completed':
                return todos.filter(t => t.completed);
            default:
                return todos;
        }
    }

    updateStats() {
        const todos = this.storage.getTodos();
        const completed = todos.filter(t => t.completed).length;
        const active = todos.length - completed;

        this.elements.totalTasks.textContent = `Total: ${todos.length}`;
        this.elements.activeTasks.textContent = `Active: ${active}`;
        this.elements.completedTasks.textContent = `Completed: ${completed}`;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        const todos = this.storage.getTodos();

        // Update stats
        this.updateStats();

        // Clear list
        this.elements.todoList.innerHTML = '';

        // Show/hide empty state
        if (todos.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.clearCompleted.disabled = true;
            this.elements.deleteAll.disabled = true;
        } else {
            this.elements.emptyState.classList.add('hidden');
            this.elements.deleteAll.disabled = false;
            const hasCompleted = todos.some(t => t.completed);
            this.elements.clearCompleted.disabled = !hasCompleted;
        }

        // Render todos
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            const priorityClass = `priority-${todo.priority}`;
            const priorityLabel = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);

            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="todo-priority ${priorityClass}">${priorityLabel}</span>
                <span class="todo-date">${todo.createdAt}</span>
                <div class="todo-actions">
                    <button class="todo-btn edit-btn" title="Edit" data-id="${todo.id}">✎</button>
                    <button class="todo-btn delete-btn" title="Delete" data-id="${todo.id}">✕</button>
                </div>
            `;

            // Event listeners
            li.querySelector('.checkbox').addEventListener('change', () => {
                this.toggleTodo(todo.id);
            });

            li.querySelector('.edit-btn').addEventListener('click', () => {
                this.editTodo(todo.id);
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.deleteTodo(todo.id);
            });

            this.elements.todoList.appendChild(li);
        });

        // Show filtered message if no results but todos exist
        if (filteredTodos.length === 0 && todos.length > 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.style.cssText = 'text-align: center; padding: 30px; color: #9ca3af;';
            emptyMessage.textContent = 'No tasks in this category';
            this.elements.todoList.appendChild(emptyMessage);
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
