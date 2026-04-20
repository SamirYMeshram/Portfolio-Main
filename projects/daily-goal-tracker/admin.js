(function () {
  const { AppStore } = window;

  const state = {
    search: '',
    category: 'all',
    platform: 'all',
    active: 'all',
    editingId: null,
    tasks: []
  };

  const el = {
    logoutBtn: document.getElementById('logoutBtn'),
    exportTasksBtn: document.getElementById('exportTasksBtn'),
    restorePdfTasksBtn: document.getElementById('restorePdfTasksBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    adminTotalTasks: document.getElementById('adminTotalTasks'),
    adminActiveTasks: document.getElementById('adminActiveTasks'),
    adminInactiveTasks: document.getElementById('adminInactiveTasks'),
    adminCategoryCount: document.getElementById('adminCategoryCount'),
    adminPlatformCount: document.getElementById('adminPlatformCount'),
    taskForm: document.getElementById('taskForm'),
    editTaskId: document.getElementById('editTaskId'),
    taskTitle: document.getElementById('taskTitle'),
    taskCategory: document.getElementById('taskCategory'),
    taskPlatform: document.getElementById('taskPlatform'),
    taskSection: document.getElementById('taskSection'),
    taskTarget: document.getElementById('taskTarget'),
    taskTime: document.getElementById('taskTime'),
    taskPriority: document.getElementById('taskPriority'),
    taskActive: document.getElementById('taskActive'),
    taskNotes: document.getElementById('taskNotes'),
    resetTaskFormBtn: document.getElementById('resetTaskFormBtn'),
    taskFormMessage: document.getElementById('taskFormMessage'),
    taskSearchInput: document.getElementById('taskSearchInput'),
    adminCategoryFilter: document.getElementById('adminCategoryFilter'),
    adminPlatformFilter: document.getElementById('adminPlatformFilter'),
    adminActiveFilter: document.getElementById('adminActiveFilter'),
    taskTableBody: document.getElementById('taskTableBody'),
    categoryCountList: document.getElementById('categoryCountList'),
    platformCountList: document.getElementById('platformCountList'),
    adminActivityList: document.getElementById('adminActivityList')
  };

  function esc(value) { return AppStore.escapeHtml(value); }

  function setMessage(type, text) {
    el.taskFormMessage.className = 'form-message' + (type ? ' ' + type : '');
    el.taskFormMessage.textContent = text || '';
  }

  function resetForm() {
    state.editingId = null;
    el.editTaskId.value = '';
    el.taskForm.reset();
    el.taskPriority.value = 'Medium';
    el.taskActive.value = 'true';
    setMessage('', '');
  }

  function fillForm(taskId) {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return;
    state.editingId = taskId;
    el.editTaskId.value = task.id;
    el.taskTitle.value = task.title || '';
    el.taskCategory.value = task.category || '';
    el.taskPlatform.value = task.platform || '';
    el.taskSection.value = task.section || '';
    el.taskTarget.value = task.target || '';
    el.taskTime.value = task.estimatedTime || '';
    el.taskPriority.value = task.priority || 'Medium';
    el.taskActive.value = String(task.active !== false);
    el.taskNotes.value = task.notes || '';
    setMessage('success', `Editing ${task.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function getFilteredTasks() {
    return state.tasks.filter((task) => {
      const hay = `${task.title} ${task.category} ${task.platform} ${task.section} ${task.target}`.toLowerCase();
      const status = task.active === false ? 'inactive' : 'active';
      return hay.includes(state.search.toLowerCase())
        && (state.category === 'all' || task.category === state.category)
        && (state.platform === 'all' || task.platform === state.platform)
        && (state.active === 'all' || status === state.active);
    });
  }

  function countBy(items, key) {
    const map = {};
    items.forEach((item) => { map[item[key]] = (map[item[key]] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }

  function renderCounts() {
    const tasks = state.tasks;
    const activeTasks = tasks.filter((task) => task.active !== false);
    el.adminTotalTasks.textContent = tasks.length;
    el.adminActiveTasks.textContent = activeTasks.length;
    el.adminInactiveTasks.textContent = tasks.length - activeTasks.length;
    el.adminCategoryCount.textContent = [...new Set(tasks.map((task) => task.category).filter(Boolean))].length;
    el.adminPlatformCount.textContent = [...new Set(tasks.map((task) => task.platform).filter(Boolean))].length;
  }

  function renderFilters() {
    const categories = AppStore.getCategoriesFromTasks(state.tasks);
    const platforms = AppStore.getPlatformsFromTasks(state.tasks);
    el.adminCategoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map((item) => `<option value="${esc(item)}">${esc(item)}</option>`).join('');
    el.adminPlatformFilter.innerHTML = '<option value="all">All Platforms</option>' + platforms.map((item) => `<option value="${esc(item)}">${esc(item)}</option>`).join('');
    el.adminCategoryFilter.value = state.category;
    el.adminPlatformFilter.value = state.platform;
  }

  function renderTaskTable() {
    const tasks = getFilteredTasks();
    if (!tasks.length) {
      el.taskTableBody.innerHTML = '<tr><td colspan="7" class="muted">No tasks match the filters.</td></tr>';
      return;
    }
    el.taskTableBody.innerHTML = tasks.map((task) => `
      <tr>
        <td>
          <strong>${esc(task.title)}</strong>
          <div class="task-tags top-gap">${task.estimatedTime ? `<span>${esc(task.estimatedTime)}</span>` : ''}<span class="badge ${String(task.priority || 'medium').toLowerCase()}">${esc(task.priority || 'Medium')}</span></div>
        </td>
        <td>${esc(task.category)}</td>
        <td>${esc(task.platform)}</td>
        <td>${esc(task.section || '-')}</td>
        <td>${esc(task.target)}</td>
        <td><span class="badge ${task.active === false ? 'inactive' : 'active'}">${task.active === false ? 'Inactive' : 'Active'}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-outline edit-task-btn" data-id="${task.id}" type="button">Edit</button>
            <button class="btn btn-outline toggle-task-btn" data-id="${task.id}" type="button">${task.active === false ? 'Enable' : 'Disable'}</button>
            <button class="btn btn-danger delete-task-btn" data-id="${task.id}" type="button">Delete</button>
          </div>
        </td>
      </tr>`).join('');

    el.taskTableBody.querySelectorAll('.edit-task-btn').forEach((button) => button.addEventListener('click', () => fillForm(button.dataset.id)));
    el.taskTableBody.querySelectorAll('.toggle-task-btn').forEach((button) => button.addEventListener('click', async () => {
      try {
        await AppStore.toggleTaskActive(button.dataset.id);
        await refreshAll();
      } catch (error) {
        setMessage('error', error.message || 'Could not change task status.');
      }
    }));
    el.taskTableBody.querySelectorAll('.delete-task-btn').forEach((button) => button.addEventListener('click', async () => {
      if (!confirm('Delete this task from master list? If it already has history, it will be archived instead.')) return;
      try {
        await AppStore.deleteTask(button.dataset.id);
        await refreshAll();
      } catch (error) {
        setMessage('error', error.message || 'Could not delete task.');
      }
    }));
  }

  async function renderSideLists() {
    const categories = countBy(state.tasks, 'category');
    const platforms = countBy(state.tasks, 'platform');
    el.categoryCountList.innerHTML = categories.map(([name, count]) => `<div class="mini-panel"><strong>${esc(name)}</strong><span class="muted">${count} task(s)</span></div>`).join('') || '<div class="empty-state">No categories.</div>';
    el.platformCountList.innerHTML = platforms.map(([name, count]) => `<div class="mini-panel"><strong>${esc(name)}</strong><span class="muted">${count} task(s)</span></div>`).join('') || '<div class="empty-state">No platforms.</div>';

    try {
      const data = await AppStore.getRecentActivity(12);
      const logs = data.logs || [];
      el.adminActivityList.innerHTML = logs.length ? logs.map((log) => `
        <div class="activity-item">
          <strong>${esc(log.action)}</strong>
          <div class="task-tags"><span>${esc(log.taskTitle || '-')}</span><span>${esc(log.category || '-')}</span><span>${esc(log.platform || '-')}</span></div>
          <p class="page-note">${esc(AppStore.formatDateTime(log.timestamp))}</p>
        </div>`).join('') : '<div class="empty-state">No activity yet.</div>';
    } catch (error) {
      el.adminActivityList.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
    }
  }

  async function renderAll() {
    renderCounts();
    renderFilters();
    renderTaskTable();
    await renderSideLists();
  }

  async function refreshAll(showMessage) {
    try {
      state.tasks = await AppStore.getTasks(true);
      await renderAll();
      if (showMessage) setMessage('success', showMessage);
    } catch (error) {
      setMessage('error', error.message || 'Could not load tasks.');
    }
  }

  function attachEvents() {
    el.logoutBtn.addEventListener('click', async () => {
      try { await AppStore.logout(); } catch (error) {}
      window.location.href = 'login.html';
    });

    el.taskForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const isEditing = !!state.editingId;
      const currentTask = isEditing ? (state.tasks.find((item) => item.id === state.editingId) || {}) : {};
      const payload = {
        ...currentTask,
        id: state.editingId || currentTask.id,
        title: el.taskTitle.value.trim(),
        category: el.taskCategory.value.trim(),
        platform: el.taskPlatform.value.trim(),
        section: el.taskSection.value.trim(),
        target: el.taskTarget.value.trim(),
        estimatedTime: el.taskTime.value.trim(),
        priority: el.taskPriority.value,
        active: el.taskActive.value === 'true',
        repeatDaily: currentTask.repeatDaily !== false,
        sortOrder: currentTask.sortOrder || (state.tasks.length + 1),
        topic: currentTask.topic || '',
        notes: el.taskNotes.value.trim()
      };

      try {
        await AppStore.saveTask(payload);
        resetForm();
        await refreshAll(isEditing ? 'Task updated successfully.' : 'Task added successfully.');
      } catch (error) {
        setMessage('error', error.message || 'Could not save task.');
      }
    });

    el.resetTaskFormBtn.addEventListener('click', resetForm);
    el.taskSearchInput.addEventListener('input', (e) => { state.search = e.target.value; renderTaskTable(); });
    el.adminCategoryFilter.addEventListener('change', (e) => { state.category = e.target.value; renderTaskTable(); });
    el.adminPlatformFilter.addEventListener('change', (e) => { state.platform = e.target.value; renderTaskTable(); });
    el.adminActiveFilter.addEventListener('change', (e) => { state.active = e.target.value; renderTaskTable(); });

    el.exportTasksBtn.addEventListener('click', () => {
      AppStore.downloadTextFile('daily-goal-master-tasks.json', AppStore.exportTasksJson(state.tasks), 'application/json;charset=utf-8');
    });

    el.restorePdfTasksBtn.addEventListener('click', async () => {
      if (!confirm('Restore the default PDF-based task list? Existing custom tasks will be disabled, matching defaults will be refreshed, and missing defaults will be added.')) return;
      try {
        await AppStore.resetTasksToDefault();
        resetForm();
        await refreshAll('Default PDF task list restored.');
      } catch (error) {
        setMessage('error', error.message || 'Could not restore default tasks.');
      }
    });

    el.clearHistoryBtn.addEventListener('click', async () => {
      if (!confirm('Clear all submitted day history and activity logs only? Master tasks stay safe.')) return;
      try {
        await AppStore.clearHistoryOnly();
        await refreshAll('History cleared successfully.');
      } catch (error) {
        setMessage('error', error.message || 'Could not clear history.');
      }
    });
  }

  async function init() {
    await (window.__authReadyPromise || Promise.resolve());
    attachEvents();
    await refreshAll();
  }

  init();
})();
