class SwimlaneTracker {
    constructor() {
        this.weeks = 9;
        this.swimlanes = [
            { id: 'marketing', name: 'Marketing' },
            { id: 'management', name: 'Management' },
            { id: 'webdesign', name: 'Web Design Team' }
        ];
        this.tasks = [
            {
                id: 'suggest-changes',
                name: 'Suggest changes to website',
                swimlane: 'marketing',
                start: 2,
                duration: 1,
                color: '#FF9800',
                dependencies: []
            },
            {
                id: 'evaluate-changes',
                name: 'Evaluate changes',
                swimlane: 'management',
                start: 3,
                duration: 1,
                color: '#2196F3',
                dependencies: ['suggest-changes']
            },
            {
                id: 'check-changes',
                name: 'Check suggested changes',
                swimlane: 'webdesign',
                start: 4,
                duration: 1,
                color: '#2196F3',
                dependencies: ['evaluate-changes']
            },
            {
                id: 'reevaluate-changes',
                name: 'Re-evaluate changes',
                swimlane: 'management',
                start: 6,
                duration: 1,
                color: '#2196F3',
                dependencies: ['check-changes']
            },
            {
                id: 'evaluate-new-changes',
                name: 'Evaluate new changes',
                swimlane: 'management',
                start: 7,
                duration: 1,
                color: '#2196F3',
                dependencies: ['reevaluate-changes']
            },
            {
                id: 'implement-changes',
                name: 'Implement changes to website',
                swimlane: 'marketing',
                start: 9,
                duration: 2,
                color: '#FF9800',
                dependencies: ['evaluate-new-changes']
            }
        ];
        this.editingTask = null;
        this.autoSave = true;
        this.useSharedStorage = true; // Use server storage instead of localStorage
        this.saveTimeout = null;
        this.init();
    }

    init() {
        this.loadFromStorage().then(() => {
            this.setupEventListeners();
            this.render();
            this.clearTaskPanel(); // Initialize the task panel with proper data
            this.saveToStorage(); // Save initial state
        });
    }

    setupEventListeners() {
        // Week update
        document.getElementById('update-weeks').addEventListener('click', () => {
            const weeksInput = document.getElementById('weeks-input');
            this.weeks = parseInt(weeksInput.value);
            this.render();
            this.saveToStorage();
        });

        // Add swimlane
        document.getElementById('add-swimlane').addEventListener('click', () => {
            this.showSwimlaneModal();
        });

        // Add task
        document.getElementById('add-task').addEventListener('click', () => {
            this.showTaskInPanel();
        });

        // Task panel form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Clear task panel
        document.getElementById('clear-task').addEventListener('click', () => {
            this.clearTaskPanel();
        });

        // Delete task
        document.getElementById('delete-task').addEventListener('click', () => {
            this.deleteSelectedTask();
        });

        // Save/Load buttons
        document.getElementById('save-project').addEventListener('click', () => {
            this.exportProject();
        });

        document.getElementById('load-project').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.importProject(e.target.files[0]);
        });

        document.getElementById('reset-project').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset to the default project? All current data will be lost.')) {
                this.resetToDefault();
            }
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Cancel buttons
        document.getElementById('cancel-task').addEventListener('click', () => {
            this.closeModal(document.getElementById('task-modal'));
        });

        document.getElementById('cancel-swimlane').addEventListener('click', () => {
            this.closeModal(document.getElementById('swimlane-modal'));
        });

        // Form submissions
        document.getElementById('swimlane-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSwimlane();
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });

        // Click backdrop to close modal (mobile)
        document.getElementById('modal-backdrop').addEventListener('click', () => {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                this.closeModal(openModal);
            }
        });
    }

    render() {
        this.renderTimeline();
        this.renderSwimlanes();
        this.renderDependencyArrows();
    }

    renderTimeline() {
        const timelineHeader = document.getElementById('timeline-header');
        if (!timelineHeader) {
            console.error('Timeline header element not found!');
            return;
        }
        
        console.log('Rendering timeline with', this.weeks, 'weeks');
        timelineHeader.innerHTML = '';

        // Add swimlane label header
        const labelHeader = document.createElement('div');
        labelHeader.className = 'week-header';
        labelHeader.textContent = 'Swimlanes';
        timelineHeader.appendChild(labelHeader);

        // Add week headers
        for (let i = 1; i <= this.weeks; i++) {
            const weekHeader = document.createElement('div');
            weekHeader.className = 'week-header';
            weekHeader.textContent = `Week ${i}`;
            timelineHeader.appendChild(weekHeader);
        }
        
        console.log('Timeline rendered successfully');
    }

    renderSwimlanes() {
        const swimlanesContainer = document.getElementById('swimlanes-container');
        if (!swimlanesContainer) {
            console.error('Swimlanes container element not found!');
            return;
        }
        
        console.log('Rendering', this.swimlanes.length, 'swimlanes');
        swimlanesContainer.innerHTML = '';

        this.swimlanes.forEach(swimlane => {
            const swimlaneDiv = document.createElement('div');
            swimlaneDiv.className = 'swimlane';
            swimlaneDiv.dataset.swimlaneId = swimlane.id;

            // Swimlane label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'swimlane-label';
            labelDiv.textContent = swimlane.name;

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-swimlane';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteSwimlane(swimlane.id);
            });
            labelDiv.appendChild(deleteBtn);

            swimlaneDiv.appendChild(labelDiv);

            // Week columns
            const weeksDiv = document.createElement('div');
            weeksDiv.className = 'swimlane-weeks';

            for (let i = 1; i <= this.weeks; i++) {
                const weekColumn = document.createElement('div');
                weekColumn.className = 'week-column';
                weeksDiv.appendChild(weekColumn);
            }

            swimlaneDiv.appendChild(weeksDiv);
            swimlanesContainer.appendChild(swimlaneDiv);

            // Render tasks for this swimlane
            this.renderTasksForSwimlane(swimlane.id, weeksDiv);
        });
    }

    renderTasksForSwimlane(swimlaneId, weeksContainer) {
        const swimlaneTasks = this.tasks.filter(task => task.swimlane === swimlaneId);
        
        swimlaneTasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.dataset.taskId = task.id;
            taskDiv.textContent = task.name;
            taskDiv.style.backgroundColor = task.color;

            // Position task
            const weekWidth = 120; // Should match CSS
            const left = (task.start - 1) * weekWidth;
            const width = task.duration * weekWidth - 10; // -10 for gap

            taskDiv.style.left = `${left + 5}px`;
            taskDiv.style.width = `${width}px`;
            taskDiv.style.top = `${20 + (index * 35)}px`;

            // Check if task is blocked
            if (this.isTaskBlocked(task)) {
                taskDiv.classList.add('blocked');
            }

            // Add click handler for editing
            taskDiv.addEventListener('click', () => {
                this.editTask(task);
            });

            // Add double-click handler for completion toggle
            taskDiv.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.toggleTaskCompletion(task.id);
            });

            weeksContainer.appendChild(taskDiv);
        });
    }

    renderDependencyArrows() {
        // Remove existing arrows
        document.querySelectorAll('.dependency-arrow').forEach(arrow => arrow.remove());

        this.tasks.forEach(task => {
            task.dependencies.forEach(depId => {
                this.drawDependencyArrow(depId, task.id);
            });
        });
    }

    drawDependencyArrow(fromTaskId, toTaskId) {
        const fromTask = this.tasks.find(t => t.id === fromTaskId);
        const toTask = this.tasks.find(t => t.id === toTaskId);
        
        if (!fromTask || !toTask) return;

        const fromElement = document.querySelector(`[data-task-id="${fromTaskId}"]`);
        const toElement = document.querySelector(`[data-task-id="${toTaskId}"]`);
        
        if (!fromElement || !toElement) return;

        const container = document.getElementById('swimlanes-container');
        const containerRect = container.getBoundingClientRect();
        
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        // Calculate relative positions
        const fromX = fromRect.right - containerRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
        const toX = toRect.left - containerRect.left;
        const toY = toRect.top + toRect.height / 2 - containerRect.top;

        // Create SVG arrow
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '3';
        svg.classList.add('dependency-arrow');

        // Add arrowhead marker
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrowhead-${fromTaskId}-${toTaskId}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#e74c3c');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        svg.appendChild(defs);

        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        let pathData;
        if (fromTask.swimlane === toTask.swimlane) {
            // Same swimlane - curved arrow
            const midX = (fromX + toX) / 2;
            const controlY = fromY - 30;
            pathData = `M ${fromX} ${fromY} Q ${midX} ${controlY} ${toX} ${toY}`;
        } else {
            // Different swimlanes - straight arrow with bend
            const midX = (fromX + toX) / 2;
            pathData = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
        }

        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#e74c3c');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', `url(#arrowhead-${fromTaskId}-${toTaskId})`);

        svg.appendChild(path);
        container.appendChild(svg);
    }

    isTaskBlocked(task) {
        return task.dependencies.some(depId => {
            const depTask = this.tasks.find(t => t.id === depId);
            return depTask && !depTask.completed && (depTask.start + depTask.duration > task.start);
        });
    }

    showTaskInPanel(task = null) {
        this.editingTask = task;
        const title = document.getElementById('task-panel-title');
        
        // Update title based on whether we're adding or viewing/editing
        if (task) {
            title.textContent = 'Edit Task';
        } else {
            title.textContent = 'Add New Task';
        }
        
        // Populate swimlane options
        const swimlaneSelect = document.getElementById('task-swimlane');
        swimlaneSelect.innerHTML = '';
        this.swimlanes.forEach(swimlane => {
            const option = document.createElement('option');
            option.value = swimlane.id;
            option.textContent = swimlane.name;
            swimlaneSelect.appendChild(option);
        });

        // Populate dependency options
        const dependencySelect = document.getElementById('task-dependency');
        dependencySelect.innerHTML = '<option value="">None</option>';
        this.tasks.filter(t => !task || t.id !== task.id).forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.name;
            dependencySelect.appendChild(option);
        });

        if (task) {
            // Populate form with existing task data
            document.getElementById('task-name').value = task.name;
            document.getElementById('task-swimlane').value = task.swimlane;
            document.getElementById('task-start').value = task.start;
            document.getElementById('task-duration').value = task.duration;
            document.getElementById('task-color').value = task.color;
            document.getElementById('task-dependency').value = task.dependencies[0] || '';
            
            // Update button text and show delete button
            document.getElementById('task-submit-btn').textContent = 'Update Task';
            document.getElementById('delete-task').style.display = 'inline-block';
        } else {
            // Reset form for new task
            document.getElementById('task-form').reset();
            document.getElementById('task-color').value = '#4CAF50';
            document.getElementById('task-start').value = 1;
            document.getElementById('task-duration').value = 2;
            
            // Update button text and hide delete button
            document.getElementById('task-submit-btn').textContent = 'Add Task';
            document.getElementById('delete-task').style.display = 'none';
        }
    }

    clearTaskPanel() {
        this.editingTask = null;
        document.getElementById('task-panel-title').textContent = 'Add New Task';
        document.getElementById('task-form').reset();
        document.getElementById('task-color').value = '#4CAF50';
        document.getElementById('task-start').value = 1;
        document.getElementById('task-duration').value = 2;
        document.getElementById('task-submit-btn').textContent = 'Add Task';
        document.getElementById('delete-task').style.display = 'none';
        
        // Re-populate swimlanes and dependencies
        this.updateTaskPanelSwimlanes();
        this.updateTaskPanelDependencies();
    }

    deleteSelectedTask() {
        if (this.editingTask) {
            // Remove the task
            this.tasks = this.tasks.filter(task => task.id !== this.editingTask.id);
            
            // Remove task from any dependencies
            this.tasks.forEach(task => {
                task.dependencies = task.dependencies.filter(dep => dep !== this.editingTask.id);
            });
            
            // Clear the panel and re-render
            this.clearTaskPanel();
            this.render();
            this.saveToStorage();
        }
    }

    handleTaskSubmit() {
        const formData = new FormData(document.getElementById('task-form'));
        const taskData = {
            name: formData.get('name') || document.getElementById('task-name').value,
            swimlane: formData.get('swimlane') || document.getElementById('task-swimlane').value,
            start: parseInt(formData.get('start') || document.getElementById('task-start').value),
            duration: parseInt(formData.get('duration') || document.getElementById('task-duration').value),
            color: formData.get('color') || document.getElementById('task-color').value,
            dependencies: []
        };

        const dependency = document.getElementById('task-dependency').value;
        if (dependency) {
            taskData.dependencies.push(dependency);
        }

        if (this.editingTask) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTask.id);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = { ...this.editingTask, ...taskData };
            }
        } else {
            // Add new task
            taskData.id = 'task-' + Date.now();
            this.tasks.push(taskData);
        }

        this.render();
        this.saveToStorage();
        
        // Clear the panel after successful submission and update dependencies
        this.clearTaskPanel();
    }

    showSwimlaneModal() {
        const modal = document.getElementById('swimlane-modal');
        document.getElementById('swimlane-form').reset();
        this.openModal(modal);
    }

    openModal(modal) {
        const backdrop = document.getElementById('modal-backdrop');
        
        modal.style.display = 'block';
        backdrop.style.display = 'block';
        // Remove the body class that was shrinking the timeline
        // document.body.classList.add('modal-open');
        
        // Use setTimeout to ensure the display change has taken effect before adding the class
        setTimeout(() => {
            modal.classList.add('show');
            backdrop.classList.add('show');
        }, 10);
        
        // Focus on the first input
        const firstInput = modal.querySelector('input[type="text"]');
        if (firstInput) {
            firstInput.focus();
        }
    }

    closeModal(modal) {
        const backdrop = document.getElementById('modal-backdrop');
        
        modal.classList.remove('show');
        backdrop.classList.remove('show');
        // Remove the body class cleanup
        // document.body.classList.remove('modal-open');
        
        // Wait for animation to complete before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            backdrop.style.display = 'none';
        }, 300);
    }

    saveSwimlane() {
        const name = document.getElementById('swimlane-name').value;
        const id = 'swimlane-' + Date.now();
        
        this.swimlanes.push({ id, name });
        
        this.closeModal(document.getElementById('swimlane-modal'));
        this.render();
        this.saveToStorage();
        
        // Update the task panel swimlanes dropdown
        this.updateTaskPanelSwimlanes();
    }

    updateTaskPanelSwimlanes() {
        // Update the swimlane dropdown in the task panel
        const swimlaneSelect = document.getElementById('task-swimlane');
        if (swimlaneSelect) {
            const currentValue = swimlaneSelect.value;
            swimlaneSelect.innerHTML = '';
            
            this.swimlanes.forEach(swimlane => {
                const option = document.createElement('option');
                option.value = swimlane.id;
                option.textContent = swimlane.name;
                swimlaneSelect.appendChild(option);
            });
            
            // Restore the previous selection if it still exists
            if (currentValue && this.swimlanes.some(s => s.id === currentValue)) {
                swimlaneSelect.value = currentValue;
            }
        }
    }

    updateTaskPanelDependencies() {
        // Update the dependency dropdown in the task panel
        const dependencySelect = document.getElementById('task-dependency');
        if (dependencySelect) {
            const currentValue = dependencySelect.value;
            dependencySelect.innerHTML = '<option value="">None</option>';
            
            this.tasks.filter(t => !this.editingTask || t.id !== this.editingTask.id).forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.name;
                dependencySelect.appendChild(option);
            });
            
            // Restore the previous selection if it still exists
            if (currentValue && this.tasks.some(t => t.id === currentValue)) {
                dependencySelect.value = currentValue;
            }
        }
    }

    editTask(task) {
        this.showTaskInPanel(task);
    }

    deleteSwimlane(swimlaneId) {
        if (confirm('Are you sure you want to delete this swimlane? All tasks in it will be removed.')) {
            this.swimlanes = this.swimlanes.filter(s => s.id !== swimlaneId);
            this.tasks = this.tasks.filter(t => t.swimlane !== swimlaneId);
            this.render();
            this.saveToStorage();
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.render();
            this.saveToStorage();
        }
    }

    // Save/Load functionality
    saveToStorage() {
        if (this.autoSave) {
            // Debounce saves to avoid too many requests
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            
            this.saveTimeout = setTimeout(() => {
                if (this.useSharedStorage) {
                    this.saveToServer();
                } else {
                    this.saveToLocalStorage();
                }
            }, 500); // Wait 500ms before saving
        }
    }

    async saveToServer() {
        try {
            const data = {
                weeks: this.weeks,
                swimlanes: this.swimlanes,
                tasks: this.tasks,
                timestamp: new Date().toISOString()
            };

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Data saved to server at', result.timestamp);
                this.showMessage('💾 Saved to shared storage', 'success');
            } else {
                throw new Error('Server save failed');
            }
        } catch (error) {
            console.warn('⚠️ Could not save to server, falling back to localStorage:', error);
            this.saveToLocalStorage();
            this.showMessage('⚠️ Saved locally only', 'warning');
        }
    }

    saveToLocalStorage() {
        const data = {
            weeks: this.weeks,
            swimlanes: this.swimlanes,
            tasks: this.tasks,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('swimlane-tracker-data', JSON.stringify(data));
    }

    async loadFromStorage() {
        if (this.useSharedStorage) {
            await this.loadFromServer();
        } else {
            this.loadFromLocalStorage();
        }
    }

    async loadFromServer() {
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                const data = await response.json();
                this.weeks = data.weeks || 9;
                this.swimlanes = data.swimlanes || this.swimlanes;
                this.tasks = data.tasks || this.tasks;
                console.log('✅ Loaded shared project from server');
                this.showMessage('📥 Loaded shared data', 'success');
            } else {
                throw new Error('Server load failed');
            }
        } catch (error) {
            console.warn('⚠️ Could not load from server, trying localStorage:', error);
            this.loadFromLocalStorage();
            this.showMessage('📥 Loaded local data', 'warning');
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('swimlane-tracker-data');
            if (saved) {
                const data = JSON.parse(saved);
                this.weeks = data.weeks || 9;
                this.swimlanes = data.swimlanes || this.swimlanes;
                this.tasks = data.tasks || this.tasks;
                console.log('✅ Loaded saved project from browser storage');
            }
        } catch (error) {
            console.warn('⚠️  Could not load saved data:', error);
        }
    }

    exportProject() {
        const data = {
            weeks: this.weeks,
            swimlanes: this.swimlanes,
            tasks: this.tasks,
            exported: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `swimlane-project-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        // Show success message
        this.showMessage('Project exported successfully!', 'success');
    }

    importProject(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (data.swimlanes && data.tasks) {
                    this.weeks = data.weeks || 9;
                    this.swimlanes = data.swimlanes;
                    this.tasks = data.tasks;
                    
                    // Update weeks input
                    document.getElementById('weeks-input').value = this.weeks;
                    
                    this.render();
                    this.saveToStorage();
                    this.showMessage('Project imported successfully!', 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showMessage('Error importing project: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    resetToDefault() {
        localStorage.removeItem('swimlane-tracker-data');
        location.reload();
    }

    showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        
        // Style the message
        Object.assign(message.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            backgroundColor: type === 'success' ? '#27ae60' : 
                           type === 'error' ? '#e74c3c' : 
                           type === 'warning' ? '#f39c12' : '#3498db'
        });
        
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
}

// Initialize the tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SwimlaneTracker();
});
