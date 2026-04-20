(function () {
  const { AppStore } = window;

  const el = {
    logoutBtn: document.getElementById('logoutBtn'),
    quickRanges: document.querySelectorAll('.quick-range'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
    applyRangeBtn: document.getElementById('applyRangeBtn'),
    downloadCsvBtn: document.getElementById('downloadCsvBtn'),
    reportActiveDays: document.getElementById('reportActiveDays'),
    reportTotalAssigned: document.getElementById('reportTotalAssigned'),
    reportTotalCompleted: document.getElementById('reportTotalCompleted'),
    reportTotalPending: document.getElementById('reportTotalPending'),
    reportAvgCompletion: document.getElementById('reportAvgCompletion'),
    bestDayLabel: document.getElementById('bestDayLabel'),
    bestDayMeta: document.getElementById('bestDayMeta'),
    currentStreakLabel: document.getElementById('currentStreakLabel'),
    currentStreakMeta: document.getElementById('currentStreakMeta'),
    historyTableBody: document.getElementById('historyTableBody'),
    activityTableBody: document.getElementById('activityTableBody'),
    heatmapWrap: document.getElementById('heatmapWrap')
  };

  let dailyBarChart;
  let completionLineChart;
  let categoryPieChart;
  let platformBarChart;
  let currentRecords = [];

  function esc(value) { return AppStore.escapeHtml(value); }
  function getRange() { return { start: el.startDate.value, end: el.endDate.value }; }

  function setRangeFromPreset(preset) {
    const range = AppStore.getDateRangePreset(preset);
    el.startDate.value = range.start;
    el.endDate.value = range.end;
    AppStore.setSettings({ lastOpenedRange: preset });
  }

  function destroyCharts() {
    [dailyBarChart, completionLineChart, categoryPieChart, platformBarChart].forEach((chart) => {
      if (chart) chart.destroy();
    });
    dailyBarChart = completionLineChart = categoryPieChart = platformBarChart = null;
  }

  function getChartOptions() {
    return {
      responsive: true,
      plugins: { legend: { labels: { color: '#e5eefc' } } },
      scales: {
        x: { ticks: { color: '#93a4c3' }, grid: { color: 'rgba(255,255,255,0.08)' } },
        y: { beginAtZero: true, ticks: { color: '#93a4c3' }, grid: { color: 'rgba(255,255,255,0.08)' } }
      }
    };
  }

  function computeStreak(records) {
    if (!records.length) return { longest: 0, current: 0 };
    let longest = 0;
    let current = 0;
    let previousDate = null;
    records.forEach((record) => {
      const d = new Date(`${record.date}T00:00:00`);
      if (!previousDate) current = 1;
      else current = Math.round((d - previousDate) / 86400000) === 1 ? current + 1 : 1;
      longest = Math.max(longest, current);
      previousDate = d;
    });
    return { longest, current };
  }

  function renderStats(records) {
    const totalAssigned = records.reduce((sum, record) => sum + Number(record.totalTasks || 0), 0);
    const totalCompleted = records.reduce((sum, record) => sum + Number(record.completedCount || 0), 0);
    const totalPending = records.reduce((sum, record) => sum + Number(record.pendingCount || 0), 0);
    const avg = records.length ? Math.round(records.reduce((sum, record) => sum + Number(record.completionRate || 0), 0) / records.length) : 0;
    const bestDay = records.slice().sort((a, b) => Number(b.completionRate || 0) - Number(a.completionRate || 0))[0];
    const streak = computeStreak(records);

    el.reportActiveDays.textContent = records.length;
    el.reportTotalAssigned.textContent = totalAssigned;
    el.reportTotalCompleted.textContent = totalCompleted;
    el.reportTotalPending.textContent = totalPending;
    el.reportAvgCompletion.textContent = `${avg}%`;
    if (bestDay) {
      el.bestDayLabel.textContent = AppStore.formatDate(bestDay.date);
      el.bestDayMeta.textContent = `${bestDay.completedCount}/${bestDay.totalTasks} tasks · ${bestDay.completionRate}%`;
    } else {
      el.bestDayLabel.textContent = '-';
      el.bestDayMeta.textContent = 'No data in selected range';
    }
    el.currentStreakLabel.textContent = records.length ? streak.current : 0;
    el.currentStreakMeta.textContent = records.length ? `Longest streak: ${streak.longest} day(s)` : 'days with at least one submission';
  }

  function renderCharts(records) {
    destroyCharts();
    const canvasIds = ['dailyBarChart', 'completionLineChart', 'categoryPieChart', 'platformBarChart'];
    canvasIds.forEach((id) => {
      const wrap = document.getElementById(id)?.parentElement;
      const old = wrap && wrap.querySelector('.empty-state');
      if (old) old.remove();
    });

    if (!records.length) {
      canvasIds.forEach((id) => {
        const wrap = document.getElementById(id)?.parentElement;
        if (!wrap) return;
        const div = document.createElement('div');
        div.className = 'empty-state top-gap';
        div.textContent = 'No data in selected range.';
        wrap.appendChild(div);
      });
      return;
    }

    const labels = records.map((record) => AppStore.formatDate(record.date));
    const completedData = records.map((record) => Number(record.completedCount || 0));
    const completionData = records.map((record) => Number(record.completionRate || 0));
    const pendingData = records.map((record) => Number(record.pendingCount || 0));
    const categoryMap = {};
    const platformMap = {};

    records.forEach((record) => {
      Object.entries(record.categoryBreakdown || {}).forEach(([key, data]) => {
        categoryMap[key] = (categoryMap[key] || 0) + Number((data && data.completed) || 0);
      });
      Object.entries(record.platformBreakdown || {}).forEach(([key, data]) => {
        platformMap[key] = (platformMap[key] || 0) + Number((data && data.completed) || 0);
      });
    });

    dailyBarChart = new Chart(document.getElementById('dailyBarChart'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Completed', data: completedData }, { label: 'Pending', data: pendingData }] },
      options: getChartOptions()
    });

    completionLineChart = new Chart(document.getElementById('completionLineChart'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Completion %', data: completionData, tension: 0.3 }] },
      options: getChartOptions()
    });

    categoryPieChart = new Chart(document.getElementById('categoryPieChart'), {
      type: 'doughnut',
      data: { labels: Object.keys(categoryMap), datasets: [{ label: 'Completed by Category', data: Object.values(categoryMap) }] },
      options: { responsive: true, plugins: { legend: { labels: { color: '#e5eefc' } } } }
    });

    const topPlatforms = Object.entries(platformMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    platformBarChart = new Chart(document.getElementById('platformBarChart'), {
      type: 'bar',
      data: { labels: topPlatforms.map((entry) => entry[0]), datasets: [{ label: 'Completed Tasks', data: topPlatforms.map((entry) => entry[1]) }] },
      options: getChartOptions()
    });
  }

  function renderHeatmap(records, start, end) {
    const recordMap = Object.fromEntries(records.map((record) => [record.date, record]));
    const startDate = start ? new Date(`${start}T00:00:00`) : new Date();
    const endDate = end ? new Date(`${end}T00:00:00`) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
      el.heatmapWrap.innerHTML = '<div class="empty-state">Choose a valid date range.</div>';
      return;
    }
    const cells = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toLocaleDateString('en-CA');
      const record = recordMap[dateStr];
      const rate = record ? Number(record.completionRate || 0) : 0;
      const bucket = rate === 0 ? 0 : rate < 20 ? 1 : rate < 40 ? 2 : rate < 60 ? 3 : rate < 80 ? 4 : 5;
      cells.push(`
        <div class="heatmap-cell heat-${bucket}" title="${dateStr} · ${rate}%">
          <div>
            <small>${d.getDate()}</small>
            <small>${record ? `${Math.round(rate)}%` : '-'}</small>
          </div>
        </div>`);
    }
    el.heatmapWrap.innerHTML = cells.join('') || '<div class="empty-state">No dates available.</div>';
  }

  function renderHistory(records) {
    if (!records.length) {
      el.historyTableBody.innerHTML = '<tr><td colspan="7" class="muted">No submitted days found for this range.</td></tr>';
      return;
    }
    el.historyTableBody.innerHTML = records.map((record) => `
      <tr>
        <td>${esc(AppStore.formatDate(record.date))}</td>
        <td>${record.totalTasks}</td>
        <td>${record.completedCount}</td>
        <td>${record.pendingCount}</td>
        <td>${record.completionRate}%</td>
        <td>${esc(AppStore.formatDateTime(record.submittedAt))}</td>
        <td>${record.submissionCount || 1}</td>
      </tr>`).join('');
  }

  function renderLogs(logs) {
    if (!logs.length) {
      el.activityTableBody.innerHTML = '<tr><td colspan="6" class="muted">No activity log found for this range.</td></tr>';
      return;
    }
    el.activityTableBody.innerHTML = logs.slice(0, 200).map((log) => `
      <tr>
        <td>${esc(AppStore.formatDateTime(log.timestamp))}</td>
        <td>${esc(AppStore.formatDate(log.date))}</td>
        <td>${esc(log.action)}</td>
        <td>${esc(log.taskTitle || '-')}</td>
        <td>${esc(log.category || '-')}</td>
        <td>${esc(log.platform || '-')}</td>
      </tr>`).join('');
  }

  async function renderReport() {
    const { start, end } = getRange();
    try {
      const data = await AppStore.getReport(start, end);
      const records = (data.records || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
      currentRecords = records;
      renderStats(records);
      renderCharts(records);
      renderHeatmap(records, AppStore.normalizeDateInput(start), AppStore.normalizeDateInput(end));
      renderHistory(records);
      renderLogs(data.logs || []);
    } catch (error) {
      currentRecords = [];
      renderStats([]);
      destroyCharts();
      renderHeatmap([], start, end);
      el.historyTableBody.innerHTML = `<tr><td colspan="7" class="muted">${esc(error.message || 'Could not load report.')}</td></tr>`;
      el.activityTableBody.innerHTML = '<tr><td colspan="6" class="muted">No activity log found.</td></tr>';
    }
  }

  function attachEvents() {
    el.logoutBtn.addEventListener('click', async () => {
      try { await AppStore.logout(); } catch (error) {}
      window.location.href = 'login.html';
    });
    el.applyRangeBtn.addEventListener('click', renderReport);
    el.quickRanges.forEach((button) => {
      button.addEventListener('click', () => {
        setRangeFromPreset(button.dataset.range);
        renderReport();
      });
    });
    el.downloadCsvBtn.addEventListener('click', () => {
      const { start, end } = getRange();
      const csv = AppStore.exportRecordsCsv(currentRecords);
      AppStore.downloadTextFile(`daily-goal-report-${start || 'all'}-to-${end || 'all'}.csv`, csv, 'text/csv;charset=utf-8');
    });
  }

  async function init() {
    await (window.__authReadyPromise || Promise.resolve());
    const preset = AppStore.getSettings().lastOpenedRange || '7';
    setRangeFromPreset(preset);
    attachEvents();
    renderReport();
  }

  init();
})();
