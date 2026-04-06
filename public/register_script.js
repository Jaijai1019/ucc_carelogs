document.addEventListener('db:ready', function () {
  const registerBtn = document.getElementById('registerBtn');
  const errorMsg = document.getElementById('regErrorMsg');
  const formWrap = document.getElementById('registerFormWrap');
  const successMsg = document.getElementById('regSuccessMsg');

  if (!registerBtn) return;

  registerBtn.addEventListener('click', function () {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const position = document.getElementById('regPosition').value;

    errorMsg.textContent = '';

    if (!firstName || !lastName || !email || !password || !position) {
      errorMsg.textContent = 'Please fill in all required fields.';
      return;
    }

    if (password.length < 4) {
      errorMsg.textContent = 'Password must be at least 4 characters.';
      return;
    }

    const result = DB.registerUser(firstName, lastName, email, password, position);

    if (result.success) {
      formWrap.style.display = 'none';
      successMsg.style.display = 'block';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      errorMsg.textContent = result.message || 'Registration failed. Try again.';
    }
  });
});
