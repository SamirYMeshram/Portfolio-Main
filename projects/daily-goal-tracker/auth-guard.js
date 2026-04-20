(function () {
  var CACHE_KEY = 'dgt_supabase_session_cache';

  function setCache(session) {
    try {
      if (!session || !session.user) {
        localStorage.removeItem(CACHE_KEY);
        return;
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        userId: session.user.id,
        email: session.user.email || '',
        expiresAt: session.expires_at || null
      }));
    } catch (error) {}
  }

  document.documentElement.style.visibility = 'hidden';

  window.__authReadyPromise = window.supabaseClient.auth.getSession()
    .then(function (result) {
      var session = result && result.data ? result.data.session : null;
      if (!session || !session.user) {
        setCache(null);
        window.location.replace('login.html');
        throw new Error('No active session');
      }
      setCache(session);
      document.documentElement.style.visibility = 'visible';
      return session;
    })
    .catch(function (error) {
      setCache(null);
      window.location.replace('login.html');
      throw error;
    });
})();
