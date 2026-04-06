
document.addEventListener('db:ready', function () {
  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  setupLogout();
  loadLogs();

  document.getElementById('searchLogs').addEventListener('input', loadLogs);
  document.getElementById('filterDate').addEventListener('change', loadLogs);


  document.getElementById('closeViewModal').addEventListener('click', closeViewModal);
  document.getElementById('closeViewBtn').addEventListener('click', closeViewModal);
  document.getElementById('viewModal').addEventListener('click', function (e) {
    if (e.target === this) closeViewModal();
  });
});

function loadLogs() {
  const search = document.getElementById('searchLogs').value.trim();
  const date = document.getElementById('filterDate').value;
  const logs = DB.getAllLogs(search, date);
  renderLogsTable(logs);
}

function renderLogsTable(logs) {
  const tbody = document.getElementById('logsTableBody');

  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="11" class="empty-state">No clinic logs found.</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map((log, index) => `
    <tr>
      <td>${index + 1}</td>
      <td><strong>${escHtml(log.firstName + ' ' + log.lastName)}</strong></td>
      <td>${escHtml(log.studentID)}</td>
      <td>${escHtml(log.course)}</td>
      <td>${escHtml(log.visitDate)}</td>
      <td>${escHtml(log.visitTime || '—')}</td>
      <td>${escHtml(log.complaint || '—')}</td>
      <td>${escHtml(log.itemName || '—')}</td>
      <td>${log.quantityGiven > 0 ? log.quantityGiven : '—'}</td>
      <td>${escHtml(log.notes || '—')}</td>
      <td>
        <button class="btn-edit" onclick="viewLogDetail(${log.id})">View</button>
        <button class="btn-danger" onclick="deleteLog(${log.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function viewLogDetail(id) {
  const log = DB.getLogById(id);
  if (!log) return;

  const content = document.getElementById('logDetailContent');
  content.innerHTML = `
    <table style="width:100%; border-collapse:collapse;">
      ${detailRow('Student Name', log.firstName + ' ' + log.lastName)}
      ${detailRow('Student ID', log.studentID)}
      ${detailRow('Course / Year', log.course)}
      ${detailRow('Gender', log.gender || '—')}
      ${detailRow('Visit Date', log.visitDate)}
      ${detailRow('Visit Time', log.visitTime || '—')}
      ${detailRow('Complaint', log.complaint || '—')}
      ${detailRow('Item Given', log.itemName || '—')}
      ${detailRow('Quantity Given', log.quantityGiven > 0 ? log.quantityGiven : '—')}
      ${detailRow('Notes / Remarks', log.notes || '—')}
      ${detailRow('Recorded By', log.recordedBy || '—')}
    </table>
  `;

  document.getElementById('viewModal').classList.add('open');
}

function detailRow(label, value) {
  return `
    <tr>
      <td style="font-weight:700; padding:6px 0; width:160px; color:#757575;">${escHtml(label)}</td>
      <td style="padding:6px 0; color:#3a3737;">${escHtml(String(value))}</td>
    </tr>
  `;
}

function closeViewModal() {
  document.getElementById('viewModal').classList.remove('open');
}

function deleteLog(id) {
  if (!confirm('Delete this clinic log? This cannot be undone.')) return;
  DB.deleteLog(id);
  loadLogs();
}

function setupLogout() {
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
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
