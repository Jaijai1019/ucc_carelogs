document.addEventListener('db:ready', function () {
  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  setupLogout();

  populateItemSelect();

  const dateField = document.getElementById('visitDate');
  if (dateField) {
    dateField.value = new Date().toISOString().split('T')[0];
  }

  const timeField = document.getElementById('visitTime');
  if (timeField) {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    timeField.value = `${hh}:${mm}`;
  }


  const saveBtn = document.getElementById('saveLogBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveLog);
  }

  const clearBtn = document.getElementById('clearLogBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
  }
});

function populateItemSelect() {
  const select = document.getElementById('itemGiven');
  if (!select) return;
  const items = DB.getItemsForSelect();
  select.innerHTML = '<option value="" disabled selected>Select from inventory</option>';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.name} (${item.quantity} ${item.unit || 'pcs'} available)`;
    opt.dataset.name = item.name;
    select.appendChild(opt);
  });
  if (!items.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No items in inventory';
    opt.disabled = true;
    select.appendChild(opt);
  }
}

function saveLog() {
  const alertSuccess = document.getElementById('alertSuccess');
  const alertError = document.getElementById('alertError');
  alertSuccess.style.display = 'none';
  alertError.style.display = 'none';

  const firstName = document.getElementById('stuFirstName').value.trim();
  const lastName = document.getElementById('stuLastName').value.trim();
  const studentID = document.getElementById('stuID').value.trim();
  const course = document.getElementById('stuCourse').value.trim();
  const visitDate = document.getElementById('visitDate').value;

  if (!firstName || !lastName || !studentID || !course || !visitDate) {
    alertError.style.display = 'block';
    alertError.textContent = 'Please fill in all required fields (First Name, Last Name, ID, Course, Date).';
    return;
  }

  const itemSelect = document.getElementById('itemGiven');
  const selectedOption = itemSelect.options[itemSelect.selectedIndex];
  const itemId = itemSelect.value || null;
  const itemName = itemId && selectedOption ? selectedOption.dataset.name || '' : '';
  const quantityGiven = parseInt(document.getElementById('quantityGiven').value) || 0;

  const user = DB.getCurrentUser();

  DB.addLog({
    firstName,
    lastName,
    studentID,
    course,
    gender: document.getElementById('stuGender').value || '',
    visitDate,
    visitTime: document.getElementById('visitTime').value || '',
    complaint: document.getElementById('complaint').value.trim(),
    itemId: itemId ? parseInt(itemId) : null,
    itemName,
    quantityGiven,
    notes: document.getElementById('notes').value.trim(),
    recordedBy: user ? `${user.firstName} ${user.lastName}` : ''
  });


  if (itemId && quantityGiven > 0) {
    DB.decrementItemQuantity(parseInt(itemId), quantityGiven);
  }

  alertSuccess.style.display = 'block';
  clearForm();


  setTimeout(populateItemSelect, 200);
}

function clearForm() {
  ['stuFirstName', 'stuLastName', 'stuID', 'stuCourse', 'complaint', 'notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('stuGender').value = '';
  document.getElementById('itemGiven').value = '';
  document.getElementById('quantityGiven').value = '1';
  const dateField = document.getElementById('visitDate');
  if (dateField) dateField.value = new Date().toISOString().split('T')[0];
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
