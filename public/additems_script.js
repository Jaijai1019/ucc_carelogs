document.addEventListener('db:ready', function () {

  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  setupLogout();

  const saveBtn = document.getElementById('saveItemBtn');
  const clearBtn = document.getElementById('clearItemBtn');

  if (saveBtn) saveBtn.addEventListener('click', saveItem);
  if (clearBtn) clearBtn.addEventListener('click', clearForm);
});

function saveItem() {
  const alertSuccess = document.getElementById('alertSuccess');
  const alertError = document.getElementById('alertError');
  alertSuccess.style.display = 'none';
  alertError.style.display = 'none';

  const name = document.getElementById('itemName').value.trim();
  const category = document.getElementById('itemCategory').value;
  const quantity = parseInt(document.getElementById('itemQuantity').value);

  if (!name || !category || isNaN(quantity) || quantity < 0) {
    alertError.style.display = 'block';
    alertError.textContent = 'Please fill in Item Name, Category, and a valid Quantity.';
    return;
  }

  DB.addItem({
    name,
    category,
    quantity,
    unit: document.getElementById('itemUnit').value.trim(),
    expiryDate: document.getElementById('itemExpiry').value,
    description: document.getElementById('itemDescription').value.trim(),
    lowThreshold: parseInt(document.getElementById('itemLowThreshold').value) || 10
  });

  alertSuccess.style.display = 'block';
  clearForm();
}

function clearForm() {
  ['itemName', 'itemUnit', 'itemExpiry', 'itemDescription', 'itemLowThreshold', 'itemQuantity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('itemCategory').value = '';
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
