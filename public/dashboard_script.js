document.addEventListener('db:ready', function () {

  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const nameEl = document.getElementById('userNameDisplay');
  if (nameEl) {
    nameEl.textContent = user.firstName + ' ' + user.lastName;
    nameEl.style.color = '#58B2E6';
  }

  document.getElementById('totalPatients').textContent = DB.getTotalPatients();
  document.getElementById('totalItems').textContent = DB.getTotalItems();
  document.getElementById('logsToday').textContent = DB.getLogsToday();


  renderRecentRecords();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        DB.logout();
        window.location.href = 'login.html';
      }
    });
  }
});

function renderRecentRecords() {
  const tbody = document.getElementById('recentRecordsBody');
  if (!tbody) return;

  const logs = DB.getRecentLogs(10);

  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No records found.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr>
      <td>${escHtml(log.firstName + ' ' + log.lastName)}</td>
      <td>${escHtml(log.studentID)}</td>
      <td>${escHtml(log.course)}</td>
      <td>${escHtml(log.visitDate)}</td>
      <td>${escHtml(log.itemName || '—')}</td>
      <td>${escHtml(log.complaint || '—')}</td>
    </tr>
  `).join('');
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
