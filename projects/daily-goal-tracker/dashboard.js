(function () {
  const { AppStore } = window;

  const today = AppStore.today();
  const state = {
    search: '',
    category: 'all',
    platform: 'all',
    priority: 'all',
    status: 'all',
    tasks: [],
    draftMap: AppStore.loadDraftMap(today),
    savedMap: {},
    submittedAt: ''
  };

  const el = {
    logoutBtn: document.getElementById('logoutBtn'),
    todayHeading: document.getElementById('todayHeading'),
    todayDateChip: document.getElementById('todayDateChip'),
    submitStateChip: document.getElementById('submitStateChip'),
    totalTasksCount: document.getElementById('totalTasksCount'),
    completedTasksCount: document.getElementById('completedTasksCount'),
    pendingTasksCount: document.getElementById('pendingTasksCount'),
    completionRateCount: document.getElementById('completionRateCount'),
    submittedAtCount: document.getElementById('submittedAtCount'),
    progressLabel: document.getElementById('progressLabel'),
    progressFill: document.getElementById('progressFill'),
    searchInput: document.getElementById('searchInput'),
    categoryFilter: document.getElementById('categoryFilter'),
    platformFilter: document.getElementById('platformFilter'),
    priorityFilter: document.getElementById('priorityFilter'),
    statusFilter: document.getElementById('statusFilter'),
    markVisibleDoneBtn: document.getElementById('markVisibleDoneBtn'),
    clearTodayDraftBtn: document.getElementById('clearTodayDraftBtn'),
    categoryProgressList: document.getElementById('categoryProgressList'),
    taskListMeta: document.getElementById('taskListMeta'),
    pendingTaskMeta: document.getElementById('pendingTaskMeta'),
    submittedTaskMeta: document.getElementById('submittedTaskMeta'),
    groupedTaskList: document.getElementById('groupedTaskList'),
    submittedTaskList: document.getElementById('submittedTaskList'),
    dashboardMessage: document.getElementById('dashboardMessage'),
    submitTodayBtn: document.getElementById('submitTodayBtn'),
    todaySummaryBox: document.getElementById('todaySummaryBox'),
    recentActivityList: document.getElementById('recentActivityList')
  };

  function esc(value) { return AppStore.escapeHtml(value); }
  function withChecked(task) { return { ...task, checked: !!state.draftMap[task.id], savedChecked: !!state.savedMap[task.id] }; }
  function getTasks() { return state.tasks.map(withChecked); }

  function matchesFilters(task) {
    const hay = `${task.title} ${task.category} ${task.platform} ${task.section} ${task.target}`.toLowerCase();
    const status = task.checked ? 'done' : 'pending';
    return hay.includes((state.search || '').toLowerCase())
      && (state.category === 'all' || task.category === state.category)
      && (state.platform === 'all' || task.platform === state.platform)
      && (state.priority === 'all' || task.priority === state.priority)
      && (state.status === 'all' || status === state.status);
  }

  function getFilteredTasks() { return getTasks().filter(matchesFilters); }

  function groupByCategory(tasks) {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {});
  }

  function setMessage(type, text) {
    el.dashboardMessage.className = 'form-message' + (type ? ' ' + type : '');
    el.dashboardMessage.textContent = text || '';
  }

  function renderFilters() {
    const categories = AppStore.getCategoriesFromTasks(state.tasks);
    const platforms = AppStore.getPlatformsFromTasks(state.tasks);
    el.categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map((item) => `<option value="${esc(item)}">${esc(item)}</option>`).join('');
    el.platformFilter.innerHTML = '<option value="all">All Platforms</option>' + platforms.map((item) => `<option value="${esc(item)}">${esc(item)}</option>`).join('');
    el.categoryFilter.value = state.category;
    el.platformFilter.value = state.platform;
    el.priorityFilter.value = state.priority;
    el.statusFilter.value = state.status;
  }

  function renderStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.checked).length;
    const pending = total - completed;
    const rate = total ? Math.round((completed / total) * 100) : 0;
    const compare = AppStore.compareDraftToSaved(state.tasks, state.draftMap, state.savedMap, state.submittedAt);

    el.totalTasksCount.textContent = total;
    el.completedTasksCount.textContent = completed;
    el.pendingTasksCount.textContent = pending;
    el.completionRateCount.textContent = `${rate}%`;
    el.progressLabel.textContent = `${completed} / ${total} completed`;
    el.progressFill.style.width = `${rate}%`;
    el.submittedAtCount.textContent = state.submittedAt ? AppStore.formatDateTime(state.submittedAt) : 'Not yet';

    if (compare.submitted) {
      el.submitStateChip.textContent = compare.hasUnsavedChanges ? 'Unsaved Changes' : 'Submitted';
    } else {
      el.submitStateChip.textContent = Object.values(state.draftMap).some(Boolean) ? 'Draft' : 'Fresh Day';
    }
  }

  function renderCategoryProgress(allTasks) {
    const allByCategory = groupByCategory(allTasks);
    el.taskListMeta.textContent = `${allTasks.length} task(s) in today's plan`;
    const html = Object.keys(allByCategory).sort().map((category) => {
      const items = allByCategory[category];
      const completed = items.filter((item) => item.checked).length;
      const percent = items.length ? Math.round((completed / items.length) * 100) : 0;
      return `
        <div class="category-progress-item">
          <div class="meta-row">
            <strong>${esc(category)}</strong>
            <span class="muted">${completed}/${items.length} · ${percent}%</span>
          </div>
          <div class="mini-bar"><div style="width:${percent}%"></div></div>
        </div>`;
    }).join('');
    el.categoryProgressList.innerHTML = html || '<div class="empty-state">No tasks found.</div>';
  }

  function taskCard(task) {
    const edited = !!state.submittedAt && (!!state.savedMap[task.id] !== !!state.draftMap[task.id]);
    return `
      <article class="task-item ${task.checked ? 'completed-task' : ''}">
        <div class="task-row">
          <input class="task-checkbox" type="checkbox" data-task-id="${task.id}" ${task.checked ? 'checked' : ''} />
          <div class="task-main">
            <div class="task-title-row">
              <div>
                <h4 class="task-title">${esc(task.title)}</h4>
                <div class="task-meta">
                  <span>${esc(task.platform)}</span>
                  ${task.section ? `<span>${esc(task.section)}</span>` : ''}
                  <span>${esc(task.target)}</span>
                </div>
              </div>
              <div class="inline-badges">
                <span class="badge ${String(task.priority || 'medium').toLowerCase()}">${esc(task.priority || 'Medium')}</span>
                <span class="badge ${task.checked ? 'done' : 'pending'}">${task.checked ? 'Done' : 'Pending'}</span>
                ${edited ? '<span class="badge low">Edited</span>' : ''}
              </div>
            </div>
            <div class="task-tags">
              ${task.estimatedTime ? `<span>Time: ${esc(task.estimatedTime)}</span>` : ''}
              ${task.notes ? `<span>${esc(task.notes)}</span>` : ''}
            </div>
          </div>
        </div>
      </article>`;
  }

  function bindTaskCheckboxes() {
    document.querySelectorAll('.task-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        const taskId = checkbox.dataset.taskId;
        state.draftMap[taskId] = checkbox.checked;
        AppStore.updateDraftTask(today, taskId, checkbox.checked);
        renderAll();
      });
    });
  }

  function renderPendingGroups(filteredTasks) {
    const pending = filteredTasks.filter((task) => !task.checked);
    el.pendingTaskMeta.textContent = `${pending.length} pending task(s) in checklist`;
    const groups = groupByCategory(pending);
    const categories = Object.keys(groups).sort();
    if (!categories.length) {
      el.groupedTaskList.innerHTML = '<div class="empty-state">No pending tasks match the current filters.</div>';
      return;
    }
    el.groupedTaskList.innerHTML = categories.map((category, index) => {
      const items = groups[category];
      return `
        <details class="task-group" ${index < 4 ? 'open' : ''}>
          <summary>
            <div>
              <strong>${esc(category)}</strong>
              <div class="task-tags top-gap"><span>${items.length} pending</span></div>
            </div>
            <span class="muted small-text">Toggle</span>
          </summary>
          <div class="task-group-body">${items.map(taskCard).join('')}</div>
        </details>`;
    }).join('');
  }

  function renderSubmittedSection(filteredTasks) {
    const completed = filteredTasks.filter((task) => task.checked);
    const savedCompleted = completed.filter((task) => !!state.savedMap[task.id]).length;
    const unsavedCompleted = completed.length - savedCompleted;
    el.submittedTaskMeta.textContent = `${completed.length} completed today · ${savedCompleted} saved · ${unsavedCompleted} unsaved`;
    if (!completed.length) {
      el.submittedTaskList.innerHTML = '<div class="empty-state">No completed tasks for today yet.</div>';
      return;
    }
    const groups = groupByCategory(completed);
    const categories = Object.keys(groups).sort();
    el.submittedTaskList.innerHTML = categories.map((category, index) => {
      const items = groups[category];
      return `
        <details class="task-group" ${index < 3 ? 'open' : ''}>
          <summary>
            <div>
              <strong>${esc(category)}</strong>
              <div class="task-tags top-gap"><span>${items.length} completed</span></div>
            </div>
            <span class="muted small-text">Toggle</span>
          </summary>
          <div class="task-group-body">${items.map(taskCard).join('')}</div>
        </details>`;
    }).join('');
  }

  function renderSummary(tasks) {
    const compare = AppStore.compareDraftToSaved(state.tasks, state.draftMap, state.savedMap, state.submittedAt);
    const completed = tasks.filter((task) => task.checked).length;
    const savedCount = Object.values(state.savedMap).filter(Boolean).length;
    const unsavedCompleted = Math.max(0, completed - savedCount);
    const visiblePlatforms = [...new Set(tasks.map((task) => task.platform))].length;
    el.todaySummaryBox.innerHTML = `
      <div class="summary-box"><span>Platforms in today's list</span><strong>${visiblePlatforms}</strong></div>
      <div class="summary-box"><span>Completed right now</span><strong>${completed}</strong></div>
      <div class="summary-box"><span>Saved completed today</span><strong>${savedCount}</strong></div>
      <div class="summary-box"><span>Unsaved completed</span><strong>${unsavedCompleted}</strong></div>
      <div class="summary-box"><span>Submission state</span><strong>${compare.submitted ? (compare.hasUnsavedChanges ? 'Edited After Submit' : 'Saved') : 'Draft Only'}</strong></div>
    `;
  }

  async function renderActivity() {
    try {
      const data = await AppStore.getRecentActivity(24);
      const logs = (data.logs || []).filter((log) => log.date === today).slice(0, 12);
      if (!logs.length) {
        el.recentActivityList.innerHTML = '<div class="empty-state">No activity for today yet.</div>';
        return;
      }
      el.recentActivityList.innerHTML = logs.map((log) => `
        <div class="activity-item">
          <strong>${esc(log.action)}</strong>
          <div class="task-tags">
            <span>${esc(AppStore.formatDateTime(log.timestamp))}</span>
            <span>${esc(log.category || '-')}</span>
            <span>${esc(log.platform || '-')}</span>
          </div>
          <p class="page-note">${esc(log.details || '')}</p>
        </div>`).join('');
    } catch (error) {
      el.recentActivityList.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`;
    }
  }

  function renderAll() {
    const allTasks = getTasks();
    const filteredTasks = getFilteredTasks();
    renderStats(allTasks);
    renderCategoryProgress(allTasks);
    renderPendingGroups(filteredTasks);
    renderSubmittedSection(filteredTasks);
    renderSummary(allTasks);
    bindTaskCheckboxes();
    renderActivity();
  }

  async function refreshData(showMessage) {
    try {
      const [tasks, todayData] = await Promise.all([
        AppStore.getTasks(false),
        AppStore.getTodayChecklist(today)
      ]);
      state.tasks = tasks;
      state.savedMap = todayData.statusMap || {};
      state.submittedAt = todayData.lastSubmittedAt || '';
      const localDraft = AppStore.loadDraftMap(today);
      state.draftMap = state.submittedAt ? { ...state.savedMap, ...localDraft } : (Object.keys(localDraft).length ? { ...state.savedMap, ...localDraft } : { ...state.savedMap });
      AppStore.saveDraftMap(today, state.draftMap);
      renderFilters();
      renderAll();
      if (showMessage) setMessage('success', 'Checklist refreshed.');
    } catch (error) {
      setMessage('error', error && error.message ? error.message : 'Could not load today checklist.');
      if (/session expired/i.test(error.message || '')) {
        setTimeout(() => { window.location.href = 'login.html'; }, 500);
      }
    }
  }

  async function submitToday() {
    el.submitTodayBtn.disabled = true;
    setMessage('', 'Saving today checklist...');
    try {
      const record = await AppStore.submitDay(today, state.draftMap, state.tasks);
      AppStore.clearDraft(today);
      await refreshData(false);
      const completedCount = Number(record && record.completedCount != null ? record.completedCount : Object.values(state.savedMap).filter(Boolean).length);
      const totalTasks = Number(record && record.totalTasks != null ? record.totalTasks : state.tasks.length);
      setMessage('success', `Saved ${completedCount}/${totalTasks} completed tasks for ${AppStore.formatDate(today)}.`);
    } catch (error) {
      setMessage('error', error && error.message ? error.message : 'Could not save today checklist.');
    } finally {
      el.submitTodayBtn.disabled = false;
    }
  }

  function attachEvents() {
    el.logoutBtn.addEventListener('click', async () => {
      try { await AppStore.logout(); } catch (error) {}
      window.location.href = 'login.html';
    });
    el.searchInput.addEventListener('input', (e) => { state.search = e.target.value; renderAll(); });
    el.categoryFilter.addEventListener('change', (e) => { state.category = e.target.value; renderAll(); });
    el.platformFilter.addEventListener('change', (e) => { state.platform = e.target.value; renderAll(); });
    el.priorityFilter.addEventListener('change', (e) => { state.priority = e.target.value; renderAll(); });
    el.statusFilter.addEventListener('change', (e) => { state.status = e.target.value; renderAll(); });

    el.markVisibleDoneBtn.addEventListener('click', () => {
      getFilteredTasks().forEach((task) => {
        state.draftMap[task.id] = true;
      });
      AppStore.saveDraftMap(today, state.draftMap);
      renderAll();
      setMessage('', 'Visible tasks marked done in draft. Press Submit Today to save to database.');
    });

    el.clearTodayDraftBtn.addEventListener('click', () => {
      if (!confirm('Reset today draft to the last saved database state?')) return;
      state.draftMap = { ...state.savedMap };
      AppStore.saveDraftMap(today, state.draftMap);
      setMessage('', 'Today draft reset to the last saved database state.');
      renderAll();
    });

    el.submitTodayBtn.addEventListener('click', submitToday);
  }

  async function init() {
    await (window.__authReadyPromise || Promise.resolve());
    el.todayHeading.textContent = `Today Checklist · ${AppStore.formatDate(today)}`;
    el.todayDateChip.textContent = AppStore.formatDate(today);
    attachEvents();
    refreshData(false);
  }

  init();
})();
