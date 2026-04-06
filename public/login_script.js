document.addEventListener('db:ready', function () {
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMsg');
  const loginForm = document.getElementById('loginForm');
  const successMsg = document.getElementById('successMsg');

  if (!loginBtn) return;

  loginBtn.addEventListener('click', function () {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const position = document.getElementById('position').value;

    errorMsg.textContent = '';

    if (!email || !password || !position) {
      errorMsg.textContent = 'Please fill in all fields.';
      return;
    }

    const result = DB.loginUser(email, password, position);

    if (result.success) {
      loginForm.style.display = 'none';
      successMsg.style.display = 'block';
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1400);
    } else {
      errorMsg.textContent = result.message || 'Invalid username or password.';
    }
  });

  // Allow Enter key
  ['email', 'password', 'position'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') loginBtn.click();
      });
    }
  });
});
