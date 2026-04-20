(function () {
  const { AppStore } = window;
  const form = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const message = document.getElementById('loginMessage');
  const button = form.querySelector('button[type="submit"]');

  function setMessage(type, text) {
    message.className = 'form-message' + (type ? ' ' + type : '');
    message.textContent = text || '';
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    button.disabled = true;
    setMessage('', 'Signing in...');
    try {
      await AppStore.login(email.value.trim(), password.value);
      setMessage('', 'Checking task list...');
      await AppStore.ensurePdfTasksSeed();
      setMessage('success', 'Login successful. Opening dashboard...');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 250);
    } catch (error) {
      setMessage('error', error && error.message ? error.message : 'Login failed.');
    } finally {
      button.disabled = false;
    }
  });

  async function init() {
    try {
      const session = await AppStore.syncSession();
      if (session && session.user) {
        window.location.href = 'dashboard.html';
      }
    } catch (error) {
      // stay on login page
    }
  }

  init();
})();
