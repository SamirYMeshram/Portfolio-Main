(function () {
  const config = window.APP_CONFIG || {};
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error('Supabase browser library not loaded.');
  }
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase config in config.js');
  }
  window.supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
})();
