import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

if (ExecutionEnvironment.canUseDOM) {
  function checkAuth() {
    const token = localStorage.getItem('sasf_auth_token');
    try {
      const { exp } = JSON.parse(atob(token));
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  function updateUI() {
    const authenticated = checkAuth();

    // Sidebar visibility
    document.querySelectorAll('.menu__link.private').forEach(link => {
      const item = link.closest('.menu__list-item');
      if (item) {
        item.style.display = authenticated ? '' : 'none';
      }
    });

    // Navbar login button
    const loginLink = document.querySelector('a[href="/login"]');
    if (loginLink) {
      if (authenticated) {
        loginLink.textContent = '🔓';
        loginLink.title = 'Sesión activa — Clic para cerrar';
        loginLink.href = '#';
        loginLink.onclick = (e) => {
          e.preventDefault();
          localStorage.removeItem('sasf_auth_token');
          window.location.reload();
        };
      } else {
        loginLink.textContent = '🔒';
        loginLink.title = 'Contenido privado';
        loginLink.href = '/login';
        loginLink.onclick = null;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', updateUI);
  window.addEventListener('storage', updateUI);

  const origSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    origSetItem.apply(this, arguments);
    if (key === 'sasf_auth_token') updateUI();
  };
}
