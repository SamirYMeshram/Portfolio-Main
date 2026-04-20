(function () {
  const CACHE_KEY = 'dgt_supabase_session_cache';
  const KEYS = {
    settings: 'dgt_supabase_settings',
    draftPrefix: 'dgt_supabase_draft_'
  };

  const DEFAULT_SETTINGS = {
    appName: window.APP_CONFIG && window.APP_CONFIG.APP_NAME ? window.APP_CONFIG.APP_NAME : 'Daily Goal Tracker',
    lastOpenedRange: '7'
  };

  const TASK_SEED_ROWS = [
    [1, 'Tables', 'Basics & Speed Math', 'Self Study', 'Revision', '1 to 20', null, 'High', 'Daily basics'],
    [2, 'Squares', 'Basics & Speed Math', 'Self Study', 'Revision', '1 to 20', null, 'High', 'Daily basics'],
    [3, 'Cubes', 'Basics & Speed Math', 'Self Study', 'Revision', '1 to 10', null, 'High', 'Daily basics'],
    [4, 'Fractions', 'Basics & Speed Math', 'Self Study', 'Revision', '1 to 10', null, 'High', 'Daily basics'],
    [5, 'Prime Numbers', 'Basics & Speed Math', 'Self Study', 'Revision', '1 to 30', null, 'High', 'Daily basics'],
    [6, 'Percentage', 'Quantitative Aptitude', 'Guidely', 'Special Beginners Bundle', '1 mock', null, 'Medium', null],
    [7, 'Number System', 'Quantitative Aptitude', 'Guidely', 'Special Beginners Bundle', '1 mock', null, 'Medium', null],
    [8, 'Simplification', 'Quantitative Aptitude', 'Guidely', 'Special Beginners Bundle', '1 mock', null, 'Medium', null],
    [9, 'Approximation', 'Quantitative Aptitude', 'Guidely', 'Special Beginners Bundle', '1 mock', null, 'Medium', null],
    [10, 'Approximation', 'Quantitative Aptitude', 'Guidely', 'Topic-wise', '1 mock', null, 'Medium', null],
    [11, 'Percentage', 'Quantitative Aptitude', 'Guidely', 'Topic-wise', '1 mock', null, 'Medium', null],
    [12, 'Simplification', 'Quantitative Aptitude', 'Guidely', 'Topic-wise', '1 mock', null, 'Medium', null],
    [13, 'Number System', 'Quantitative Aptitude', 'Guidely', 'Topic-wise', '1 mock', null, 'Medium', null],
    [14, 'Arithmetic Master', 'Quantitative Aptitude', 'Guidely', 'Each topic', '1 mock', null, 'Medium', 'Each topic'],
    [15, 'Yes Magazine', 'Mock Tests & Practice', 'Yes Officer', 'Magazine', '2 mocks', null, 'Medium', null],
    [16, 'Prelims Exclusive', 'Mock Tests & Practice', 'Yes Officer', 'Prelims Exclusive', '2 mocks', null, 'Medium', null],
    [17, 'Special PDF (Free)', 'Mock Tests & Practice', 'Yes Officer', 'Special PDF (Free)', '2 mocks', null, 'Medium', null],
    [18, 'Simplification', 'Quantitative Aptitude', 'Adda247', 'Topic Practice', '2 questions + 2 mocks', null, 'Medium', null],
    [19, 'Approximation', 'Quantitative Aptitude', 'Adda247', 'Topic Practice', '2 questions + 2 mocks', null, 'Medium', null],
    [20, 'Percentage', 'Quantitative Aptitude', 'Adda247', 'Topic Practice', '2 questions + 2 mocks', null, 'Medium', null],
    [21, 'Number System', 'Quantitative Aptitude', 'Adda247', 'Topic Practice', '2 questions + 2 mocks', null, 'Medium', null],
    [22, 'Table Quiz', 'Coding / Technical', 'Coding C++', 'Quiz', '1 to 30', null, 'Low', null],
    [23, 'Fraction Quiz', 'Coding / Technical', 'Coding C++', 'Quiz', '1 to 30', null, 'Low', null],
    [24, 'Current Affairs Quiz', 'Reasoning & General Awareness', 'Oliveboard', 'Free Zone', '1 mock', null, 'Medium', null],
    [25, 'Free eBook Test', 'Mock Tests & Practice', 'Free eBook', 'Test', '1 mock', null, 'Low', null],
    [26, 'Banking Topic Test', 'Mock Tests & Practice', 'Practice Mock', 'Topic Test', '1 mock', null, 'Medium', null],
    [27, 'Test', 'Mock Tests & Practice', 'PW', 'Test', '2 mocks', null, 'Medium', null],
    [28, 'DPP', 'Mock Tests & Practice', 'PW', 'DPP', '2', null, 'Medium', null],
    [29, 'Math Booster', 'Quantitative Aptitude', 'Selection Way', 'Booster', '1 mock', null, 'Medium', null],
    [30, 'Calculation Booster', 'Quantitative Aptitude', 'Selection Way', 'Booster', '1 mock', null, 'Medium', null],
    [31, 'Reasoning Booster', 'Reasoning & General Awareness', 'Selection Way', 'Booster', '1 mock', null, 'Medium', null],
    [32, 'Railway Booster (Math, Science, GA)', 'Reasoning & General Awareness', 'Selection Way', 'Booster', '1 mock', null, 'Medium', null],
    [33, 'Reasoning (Free Test Pack)', 'Reasoning & General Awareness', 'Selection Way', 'Free Test Pack', '1 mock', null, 'Medium', null],
    [34, 'Daily Quiz', 'Mock Tests & Practice', 'Test Ranking', 'Quiz', '2 mocks', null, 'Medium', null],
    [35, 'Speed Math', 'Basics & Speed Math', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [36, 'Simplification', 'Quantitative Aptitude', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [37, 'Approximation', 'Quantitative Aptitude', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [38, 'Number Series', 'Quantitative Aptitude', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [39, 'Percentage', 'Quantitative Aptitude', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [40, 'Ratio & Proportion', 'Quantitative Aptitude', 'Smartkeeda', 'Speed Drill (Solo)', '40 questions', null, 'Medium', null],
    [41, 'Simplification', 'Quantitative Aptitude', 'Smartkeeda', 'Marathon Drill', '1 drill', '25 min', 'Medium', 'Combined 25 minutes'],
    [42, 'Approximation', 'Quantitative Aptitude', 'Smartkeeda', 'Marathon Drill', '1 drill', '25 min', 'Medium', 'Combined 25 minutes'],
    [43, 'Percentage', 'Quantitative Aptitude', 'Smartkeeda', 'Marathon Drill', '1 drill', '25 min', 'Medium', 'Combined 25 minutes'],
    [44, 'Ratio & Proportion', 'Quantitative Aptitude', 'Smartkeeda', 'Marathon Drill', '1 drill', '25 min', 'Medium', 'Combined 25 minutes'],
    [45, 'Speed Math', 'Basics & Speed Math', 'Smartkeeda', 'Marathon Drill', '1 drill', '25 min', 'Medium', 'Combined 25 minutes'],
    [46, 'Simplification', 'Quantitative Aptitude', 'Smartkeeda', 'Topic Test', '1 mock', null, 'Medium', null],
    [47, 'Approximation', 'Quantitative Aptitude', 'Smartkeeda', 'Topic Test', '1 mock', null, 'Medium', null],
    [48, 'Number Series', 'Quantitative Aptitude', 'Smartkeeda', 'Topic Test', '1 mock', null, 'Medium', null],
    [49, 'Percentage', 'Quantitative Aptitude', 'Smartkeeda', 'Topic Test', '1 mock', null, 'Medium', null],
    [50, 'Free PDF', 'Mock Tests & Practice', 'Smartkeeda', 'Free PDF', '1 mock', null, 'Low', null],
    [51, 'Simplification', 'Quantitative Aptitude', 'Smartkeeda', 'Free Quiz', '1 mock', null, 'Low', null],
    [52, 'Approximation', 'Quantitative Aptitude', 'Smartkeeda', 'Free Quiz', '1 mock', null, 'Low', null],
    [53, 'Squares (1-999)', 'Basics & Speed Math', 'Speed Math', 'Practice', '30 questions', null, 'High', null],
    [54, '1-100', 'Basics & Speed Math', 'Speed Math', 'Practice', '30 questions', null, 'High', null],
    [55, 'Cubes (1-30)', 'Basics & Speed Math', 'Speed Math', 'Practice', '30 questions', null, 'High', null],
    [56, 'Cubes (1-100)', 'Basics & Speed Math', 'Speed Math', 'Practice', '30 questions', null, 'High', null],
    [57, 'Square Root (1-30)', 'Basics & Speed Math', 'Speed Math', 'Practice', '30 questions', null, 'High', null],
    [58, '2-Digit Addition', 'Basics & Speed Math', 'Speed Math', 'Practice', '60 questions', null, 'High', null],
    [59, 'Addition', 'Basics & Speed Math', 'Speed Math', 'Practice', '80 questions', null, 'High', null],
    [60, 'Subtraction', 'Basics & Speed Math', 'Speed Math', 'Practice', '80 questions', null, 'High', null],
    [61, 'Multiplication', 'Basics & Speed Math', 'Speed Math', 'Practice', '80 questions', null, 'High', null],
    [62, 'Division', 'Basics & Speed Math', 'Speed Math', 'Practice', '80 questions', null, 'High', null],
    [63, 'Percentage', 'Basics & Speed Math', 'Speed Math', 'Practice', '80 questions', null, 'High', null],
    [64, 'Simplification', 'Quantitative Aptitude', 'Testbook', 'Topic Test', '1 mock', null, 'Medium', null],
    [65, 'Approximation', 'Quantitative Aptitude', 'Testbook', 'Topic Test', '1 mock', null, 'Medium', null],
    [66, 'Percentage', 'Quantitative Aptitude', 'Testbook', 'Topic Test', '1 mock', null, 'Medium', null],
    [67, 'Ratio & Proportion', 'Quantitative Aptitude', 'Testbook', 'Topic Test', '1 mock', null, 'Medium', null],
    [68, 'Free Quiz', 'Mock Tests & Practice', 'Yes Mock', 'Free Quiz', '3 mocks', null, 'Low', 'Different topics'],
    [69, 'Daily Free Quiz', 'Reasoning & General Awareness', 'Quick Trick by Sahil Sir', 'Quiz', '1 mock', null, 'Low', null],
    [70, 'Math', 'Quantitative Aptitude', 'Quick Trick by Sahil Sir', 'Quiz', '1 mock', null, 'Low', null],
    [71, 'Reasoning', 'Reasoning & General Awareness', 'Quick Trick by Sahil Sir', 'Quiz', '1 mock', null, 'Low', null],
    [72, 'GK / GS', 'Reasoning & General Awareness', 'Quick Trick by Sahil Sir', 'Quiz', '1 mock', null, 'Low', null],
    [73, 'Other Paid Test', 'Mock Tests & Practice', 'Quick Trick by Sahil Sir', 'Paid Test', 'As given', null, 'Low', null],
    [74, 'Read today\'s The Hindu newspaper', 'English & Reading', 'Self Study', 'The Hindu', 'Daily reading', null, 'High', null],
    [75, 'Career Definer', 'Video Classes / Educators', 'Kaushik Mohanty', 'Career Definer', '2 videos', null, 'Medium', null],
    [76, 'YouTube', 'Video Classes / Educators', 'Kaushik Mohanty', 'YouTube', '1 video', null, 'Medium', null],
    [77, 'Batch', 'Video Classes / Educators', 'Saurabh Sir', 'Batch', '2 videos', null, 'Medium', null],
    [78, 'YouTube', 'Video Classes / Educators', 'Saurabh Sir', 'YouTube', '1 video', null, 'Medium', null],
    [79, 'Batch', 'Video Classes / Educators', 'Kush Pandey', 'Batch', '1 video', null, 'Medium', null],
    [80, 'YouTube', 'Video Classes / Educators', 'Kush Pandey', 'YouTube', '1 video', null, 'Medium', null],
    [81, 'Batch', 'English & Reading', 'Nimisha Bansal', 'Batch', '2 videos', null, 'Medium', null],
    [82, 'Editorial', 'English & Reading', 'Nimisha Bansal', 'Editorial', '1 video', null, 'Medium', null],
    [83, 'YouTube', 'English & Reading', 'Nimisha Bansal', 'YouTube', '1 video', null, 'Medium', null],
    [84, 'Batch', 'Reasoning & General Awareness', 'Ankush Lamba', 'Batch', '1 video', null, 'Medium', null],
    [85, 'YouTube', 'Reasoning & General Awareness', 'Ankush Lamba', 'YouTube', '1 video', null, 'Medium', null],
    [86, 'Batch', 'Video Classes / Educators', 'ATM', 'Batch', '2 videos', null, 'Medium', null],
    [87, 'Batch', 'Video Classes / Educators', 'TMM', 'Batch', '1 video', null, 'Medium', null],
    [88, 'Batch', 'Video Classes / Educators', 'RMB', 'Batch', '5 videos', null, 'Medium', null]
  ];

  const DEFAULT_TASKS = TASK_SEED_ROWS.map(function (row) {
    return {
      sortOrder: row[0],
      title: row[1],
      category: row[2],
      platform: row[3],
      section: row[4],
      target: row[5],
      estimatedTime: row[6],
      priority: row[7],
      notes: row[8],
      active: true,
      repeatDaily: true,
      topic: ''
    };
  });

  let taskCache = [];
  let authListenerAttached = false;

  function getClient() {
    if (!window.supabaseClient) throw new Error('Supabase client not loaded.');
    return window.supabaseClient;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function toIsoDateLocal(input) {
    const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    return [d.getFullYear(), pad2(d.getMonth() + 1), pad2(d.getDate())].join('-');
  }

  function parseIsoDate(dateStr) {
    if (!dateStr) return null;
    const text = String(dateStr).trim();
    let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    match = text.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function normalizeDateInput(value) {
    if (!value) return '';
    const text = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const parsed = parseIsoDate(text);
    return parsed ? toIsoDateLocal(parsed) : '';
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function setSessionCache(session) {
    try {
      if (!session || !session.user) {
        localStorage.removeItem(CACHE_KEY);
        return;
      }
      writeJson(CACHE_KEY, {
        userId: session.user.id,
        email: session.user.email || '',
        expiresAt: session.expires_at || null
      });
    } catch (error) {}
  }

  function getSessionCache() {
    return readJson(CACHE_KEY, null);
  }

  function mapTaskFromDb(row) {
    return {
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      category: row.category,
      platform: row.platform,
      section: row.section || '',
      topic: row.topic || '',
      target: row.target,
      estimatedTime: row.estimated_time || '',
      priority: row.priority || 'Medium',
      active: row.active !== false,
      repeatDaily: row.repeat_daily !== false,
      sortOrder: Number(row.sort_order || 0),
      notes: row.notes || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  function mapTaskToDb(task, ownerId) {
    return {
      owner_id: ownerId,
      title: (task.title || '').trim(),
      category: (task.category || '').trim(),
      platform: (task.platform || '').trim(),
      section: (task.section || '').trim() || null,
      topic: (task.topic || '').trim() || null,
      target: (task.target || '').trim(),
      estimated_time: (task.estimatedTime || '').trim() || null,
      priority: task.priority || 'Medium',
      active: task.active !== false,
      repeat_daily: task.repeatDaily !== false,
      sort_order: Number(task.sortOrder || 0),
      notes: (task.notes || '').trim() || null
    };
  }

  function taskKey(task) {
    return [task.title, task.category, task.platform, task.section || '', task.target].join('||');
  }

  async function getUserOrThrow() {
    const client = getClient();
    const result = await client.auth.getUser();
    const user = result && result.data ? result.data.user : null;
    if (!user) throw new Error('Session expired. Please login again.');
    return user;
  }

  async function syncSession() {
    const client = getClient();
    const result = await client.auth.getSession();
    const session = result && result.data ? result.data.session : null;
    setSessionCache(session);
    return session;
  }

  async function logActivity(action, payload) {
    try {
      const user = await getUserOrThrow();
      const client = getClient();
      const entry = {
        owner_id: user.id,
        day_date: payload && payload.date ? normalizeDateInput(payload.date) || null : null,
        action: action,
        task_id: payload && payload.taskId ? payload.taskId : null,
        task_title: payload && payload.taskTitle ? payload.taskTitle : null,
        category: payload && payload.category ? payload.category : null,
        platform: payload && payload.platform ? payload.platform : null,
        details: payload && payload.details ? payload.details : null
      };
      await client.from('activity_log').insert(entry);
    } catch (error) {
      // non-fatal
    }
  }

  async function insertDefaultTasks(missingOnly) {
    const client = getClient();
    const user = await getUserOrThrow();
    let existing = [];
    if (missingOnly) {
      existing = await AppStore.getTasks(true);
    }
    const existingKeys = new Set(existing.map(taskKey));
    const rows = DEFAULT_TASKS
      .filter(function (task) { return !missingOnly || !existingKeys.has(taskKey(task)); })
      .map(function (task) { return mapTaskToDb(task, user.id); });
    if (!rows.length) return { inserted: 0 };
    const { error } = await client.from('tasks').insert(rows);
    if (error) throw error;
    taskCache = [];
    return { inserted: rows.length };
  }

  async function replaceWithDefaultTasks() {
    const client = getClient();
    const user = await getUserOrThrow();
    const current = await AppStore.getTasks(true);
    const defaultMap = new Map(DEFAULT_TASKS.map(function (task) { return [taskKey(task), task]; }));
    const seen = new Set();

    for (const currentTask of current) {
      const key = taskKey(currentTask);
      if (defaultMap.has(key)) {
        const def = defaultMap.get(key);
        seen.add(key);
        const payload = mapTaskToDb({ ...def, id: currentTask.id }, user.id);
        const { error } = await client.from('tasks').update(payload).eq('id', currentTask.id).eq('owner_id', user.id);
        if (error) throw error;
      } else if (currentTask.active !== false) {
        const { error } = await client.from('tasks').update({ active: false }).eq('id', currentTask.id).eq('owner_id', user.id);
        if (error) throw error;
      }
    }

    const missingRows = DEFAULT_TASKS
      .filter(function (task) { return !seen.has(taskKey(task)); })
      .map(function (task) { return mapTaskToDb(task, user.id); });
    if (missingRows.length) {
      const { error } = await client.from('tasks').insert(missingRows);
      if (error) throw error;
    }
    taskCache = [];
    return { inserted: missingRows.length };
  }

  function mapActivity(row) {
    return {
      id: row.id,
      timestamp: row.created_at,
      date: row.day_date || '',
      action: row.action,
      taskId: row.task_id || '',
      taskTitle: row.task_title || '',
      category: row.category || '',
      platform: row.platform || '',
      details: row.details || ''
    };
  }

  function ensureAuthListener() {
    if (authListenerAttached) return;
    authListenerAttached = true;
    getClient().auth.onAuthStateChange(function (event, session) {
      setSessionCache(session || null);
    });
  }

  const AppStore = {
    read(key, fallback) {
      return readJson(key, fallback);
    },

    write(key, value) {
      writeJson(key, value);
    },

    getSettings() {
      return this.read(KEYS.settings, clone(DEFAULT_SETTINGS));
    },

    setSettings(partial) {
      this.write(KEYS.settings, { ...this.getSettings(), ...partial });
    },

    getSession() {
      return getSessionCache();
    },

    isAuthenticated() {
      const session = this.getSession();
      return !!(session && session.userId);
    },

    async syncSession() {
      ensureAuthListener();
      return syncSession();
    },

    async login(email, password) {
      ensureAuthListener();
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message || 'Login failed.');
      setSessionCache(data.session || null);
      return true;
    },

    async logout() {
      ensureAuthListener();
      const { error } = await getClient().auth.signOut();
      setSessionCache(null);
      if (error) throw new Error(error.message || 'Could not logout.');
    },

    async validateSession() {
      const session = await syncSession();
      if (!session || !session.user) throw new Error('Session expired.');
      return session;
    },

    today() {
      return toIsoDateLocal(new Date());
    },

    formatDate(dateStr) {
      const parsed = parseIsoDate(normalizeDateInput(dateStr) || dateStr);
      if (!parsed) return '';
      return parsed.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatDateTime(value) {
      if (!value) return '';
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
    },

    normalizeDateInput(value) {
      return normalizeDateInput(value);
    },

    escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    draftKey(dateStr) {
      return KEYS.draftPrefix + dateStr;
    },

    loadDraftMap(dateStr) {
      return this.read(this.draftKey(dateStr), {});
    },

    saveDraftMap(dateStr, draftMap) {
      this.write(this.draftKey(dateStr), draftMap || {});
      return draftMap || {};
    },

    updateDraftTask(dateStr, taskId, checked) {
      const draft = { ...this.loadDraftMap(dateStr), [taskId]: !!checked };
      return this.saveDraftMap(dateStr, draft);
    },

    clearDraft(dateStr) {
      localStorage.removeItem(this.draftKey(dateStr));
    },

    async getTasks(includeInactive) {
      const user = await getUserOrThrow();
      let query = getClient()
        .from('tasks')
        .select('*')
        .eq('owner_id', user.id)
        .order('sort_order', { ascending: true })
        .order('category', { ascending: true })
        .order('title', { ascending: true });
      if (!includeInactive) query = query.eq('active', true);
      const { data, error } = await query;
      if (error) throw new Error(error.message || 'Could not load tasks.');
      taskCache = (data || []).map(mapTaskFromDb);
      return taskCache.slice();
    },

    async getTaskById(taskId) {
      if (!taskCache.length) await this.getTasks(true);
      return taskCache.find(function (task) { return task.id === taskId; }) || null;
    },

    getCategoriesFromTasks(tasks) {
      return [...new Set((tasks || []).map(function (task) { return task.category; }).filter(Boolean))].sort();
    },

    getPlatformsFromTasks(tasks) {
      return [...new Set((tasks || []).map(function (task) { return task.platform; }).filter(Boolean))].sort();
    },

    async saveTask(task) {
      const user = await getUserOrThrow();
      const payload = mapTaskToDb(task, user.id);
      if (!payload.title || !payload.category || !payload.platform || !payload.target) {
        throw new Error('Title, category, platform, and target are required.');
      }
      if (task.id) {
        const { error } = await getClient().from('tasks').update(payload).eq('id', task.id).eq('owner_id', user.id);
        if (error) throw new Error(error.message || 'Could not update task.');
        await logActivity('Task Updated', {
          taskId: task.id,
          taskTitle: payload.title,
          category: payload.category,
          platform: payload.platform,
          details: payload.section ? payload.section + ' · ' + payload.target : payload.target
        });
      } else {
        if (!payload.sort_order) {
          const current = await this.getTasks(true);
          payload.sort_order = current.length ? Math.max.apply(null, current.map(function (item) { return Number(item.sortOrder || 0); })) + 1 : 1;
        }
        const { data, error } = await getClient().from('tasks').insert(payload).select('id').single();
        if (error) throw new Error(error.message || 'Could not create task.');
        await logActivity('Task Created', {
          taskId: data && data.id ? data.id : null,
          taskTitle: payload.title,
          category: payload.category,
          platform: payload.platform,
          details: payload.section ? payload.section + ' · ' + payload.target : payload.target
        });
      }
      await this.getTasks(true);
      return true;
    },

    async deleteTask(taskId) {
      const user = await getUserOrThrow();
      const task = await this.getTaskById(taskId);
      if (!task) throw new Error('Task not found.');
      const related = await getClient().from('daily_status').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('task_id', taskId);
      if (related.count && related.count > 0) {
        const { error } = await getClient().from('tasks').update({ active: false }).eq('id', taskId).eq('owner_id', user.id);
        if (error) throw new Error(error.message || 'Could not archive task.');
        await logActivity('Task Archived', {
          taskId: taskId,
          taskTitle: task.title,
          category: task.category,
          platform: task.platform,
          details: 'History preserved'
        });
      } else {
        const { error } = await getClient().from('tasks').delete().eq('id', taskId).eq('owner_id', user.id);
        if (error) throw new Error(error.message || 'Could not delete task.');
        await logActivity('Task Deleted', {
          taskId: taskId,
          taskTitle: task.title,
          category: task.category,
          platform: task.platform,
          details: task.target
        });
      }
      await this.getTasks(true);
      return true;
    },

    async toggleTaskActive(taskId) {
      const task = await this.getTaskById(taskId);
      if (!task) throw new Error('Task not found.');
      await this.saveTask({ ...task, active: task.active === false });
      return true;
    },

    async ensurePdfTasksSeed() {
      const tasks = await this.getTasks(true);
      if (tasks.length) return false;
      const result = await insertDefaultTasks(false);
      await logActivity('Seeded Default Tasks', { details: 'Inserted ' + result.inserted + ' default tasks' });
      await this.getTasks(true);
      return true;
    },

    async resetTasksToDefault() {
      const result = await replaceWithDefaultTasks();
      await logActivity('Restored Default Tasks', { details: 'Defaults restored; inserted ' + result.inserted + ' missing tasks' });
      await this.getTasks(true);
      return result;
    },

    async clearHistoryOnly() {
      const user = await getUserOrThrow();
      const client = getClient();
      const { error: dailyError } = await client.from('daily_status').delete().eq('owner_id', user.id);
      if (dailyError) throw new Error(dailyError.message || 'Could not clear daily status.');
      const { error: logError } = await client.from('activity_log').delete().eq('owner_id', user.id);
      if (logError) throw new Error(logError.message || 'Could not clear activity log.');
      return true;
    },

    async getTodayChecklist(dateStr) {
      const user = await getUserOrThrow();
      const date = normalizeDateInput(dateStr) || this.today();
      const { data, error } = await getClient()
        .from('daily_status')
        .select('task_id, completed, submitted_at')
        .eq('owner_id', user.id)
        .eq('day_date', date);
      if (error) throw new Error(error.message || 'Could not load today checklist.');
      const statusMap = {};
      let lastSubmittedAt = '';
      (data || []).forEach(function (row) {
        statusMap[row.task_id] = !!row.completed;
        if (row.submitted_at && (!lastSubmittedAt || new Date(row.submitted_at) > new Date(lastSubmittedAt))) {
          lastSubmittedAt = row.submitted_at;
        }
      });
      return { statusMap: statusMap, lastSubmittedAt: lastSubmittedAt };
    },

    async submitDay(dateStr, draftMap, tasks) {
      const user = await getUserOrThrow();
      const client = getClient();
      const dayDate = normalizeDateInput(dateStr) || this.today();
      const now = new Date().toISOString();
      const taskList = tasks || await this.getTasks(false);
      const existing = await client.from('daily_status').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('day_date', dayDate);
      const rows = taskList.map(function (task) {
        return {
          owner_id: user.id,
          task_id: task.id,
          day_date: dayDate,
          completed: !!draftMap[task.id],
          submitted_at: now,
          task_title_snapshot: task.title,
          category_snapshot: task.category,
          platform_snapshot: task.platform,
          section_snapshot: task.section || null,
          target_snapshot: task.target,
          priority_snapshot: task.priority || 'Medium',
          estimated_time_snapshot: task.estimatedTime || null
        };
      });
      const { error } = await client.from('daily_status').upsert(rows, { onConflict: 'owner_id,day_date,task_id' });
      if (error) throw new Error(error.message || 'Could not save today checklist.');
      const completedCount = taskList.filter(function (task) { return !!draftMap[task.id]; }).length;
      await logActivity(existing.count && existing.count > 0 ? 'Updated Day' : 'Submitted Day', {
        date: dayDate,
        details: completedCount + '/' + taskList.length + ' completed'
      });
      return {
        date: dayDate,
        completedCount: completedCount,
        totalTasks: taskList.length,
        submittedAt: now
      };
    },

    async repairDatabase() {
      return { success: true, skipped: true };
    },

    async repairDatabaseOnce() {
      return { success: true, skipped: true };
    },

    async getReport(startDate, endDate) {
      const user = await getUserOrThrow();
      const client = getClient();
      const from = normalizeDateInput(startDate);
      const to = normalizeDateInput(endDate);
      let statusQuery = client
        .from('daily_status')
        .select('day_date, completed, submitted_at, category_snapshot, platform_snapshot')
        .eq('owner_id', user.id)
        .order('day_date', { ascending: true });
      let logQuery = client
        .from('activity_log')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (from) {
        statusQuery = statusQuery.gte('day_date', from);
        logQuery = logQuery.gte('day_date', from);
      }
      if (to) {
        statusQuery = statusQuery.lte('day_date', to);
        logQuery = logQuery.lte('day_date', to);
      }
      const [{ data: statuses, error: statusError }, { data: logs, error: logError }] = await Promise.all([statusQuery, logQuery]);
      if (statusError) throw new Error(statusError.message || 'Could not load report.');
      if (logError) throw new Error(logError.message || 'Could not load activity log.');

      const recordMap = new Map();
      (statuses || []).forEach(function (row) {
        if (!recordMap.has(row.day_date)) {
          recordMap.set(row.day_date, {
            date: row.day_date,
            totalTasks: 0,
            completedCount: 0,
            pendingCount: 0,
            completionRate: 0,
            submittedAt: row.submitted_at || '',
            submissionCount: 1,
            categoryBreakdown: {},
            platformBreakdown: {}
          });
        }
        const record = recordMap.get(row.day_date);
        record.totalTasks += 1;
        if (row.completed) record.completedCount += 1;
        if (row.submitted_at && (!record.submittedAt || new Date(row.submitted_at) > new Date(record.submittedAt))) {
          record.submittedAt = row.submitted_at;
        }
        const categoryKey = row.category_snapshot || 'Other';
        const platformKey = row.platform_snapshot || 'Other';
        if (!record.categoryBreakdown[categoryKey]) record.categoryBreakdown[categoryKey] = { completed: 0, total: 0 };
        if (!record.platformBreakdown[platformKey]) record.platformBreakdown[platformKey] = { completed: 0, total: 0 };
        record.categoryBreakdown[categoryKey].total += 1;
        record.platformBreakdown[platformKey].total += 1;
        if (row.completed) {
          record.categoryBreakdown[categoryKey].completed += 1;
          record.platformBreakdown[platformKey].completed += 1;
        }
      });

      const records = Array.from(recordMap.values()).map(function (record) {
        record.pendingCount = record.totalTasks - record.completedCount;
        record.completionRate = record.totalTasks ? Math.round((record.completedCount / record.totalTasks) * 100) : 0;
        return record;
      }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });

      return { records: records, logs: (logs || []).map(mapActivity) };
    },

    async getRecentActivity(limit) {
      const user = await getUserOrThrow();
      const { data, error } = await getClient()
        .from('activity_log')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit || 12);
      if (error) throw new Error(error.message || 'Could not load activity.');
      return { logs: (data || []).map(mapActivity) };
    },

    getDateRangePreset(preset) {
      const today = new Date();
      const todayStr = toIsoDateLocal(today);
      if (preset === 'today') return { start: todayStr, end: todayStr };
      if (preset === 'yesterday') {
        const day = new Date(today);
        day.setDate(today.getDate() - 1);
        const date = toIsoDateLocal(day);
        return { start: date, end: date };
      }
      if (preset === 'month') {
        const start = toIsoDateLocal(new Date(today.getFullYear(), today.getMonth(), 1));
        return { start: start, end: todayStr };
      }
      const days = Number(preset || 7);
      const start = new Date(today);
      start.setDate(today.getDate() - (days - 1));
      return { start: toIsoDateLocal(start), end: todayStr };
    },

    compareDraftToSaved(tasks, draftMap, savedMap, submittedAt) {
      const hasUnsavedChanges = (tasks || []).some(function (task) {
        return !!draftMap[task.id] !== !!savedMap[task.id];
      });
      return { submitted: !!submittedAt, hasUnsavedChanges: hasUnsavedChanges };
    },

    exportTasksJson(tasks) {
      return JSON.stringify(tasks || taskCache || [], null, 2);
    },

    exportRecordsCsv(records) {
      const rows = [['Date', 'Total Tasks', 'Completed', 'Pending', 'Completion Rate', 'Submitted At', 'Submission Count']];
      (records || []).forEach(function (record) {
        rows.push([
          record.date || '',
          record.totalTasks || 0,
          record.completedCount || 0,
          record.pendingCount || 0,
          (record.completionRate || 0) + '%',
          record.submittedAt ? AppStore.formatDateTime(record.submittedAt) : '',
          record.submissionCount || 1
        ]);
      });
      return rows.map(function (row) {
        return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
      }).join('\n');
    },

    downloadTextFile(filename, content, mimeType) {
      const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  ensureAuthListener();
  window.AppStore = AppStore;
})();
