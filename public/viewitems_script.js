let currentItems = [];

document.addEventListener('db:ready', function () {
  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  setupLogout();
  loadItems();

  // Search & filter
  document.getElementById('searchItems').addEventListener('input', loadItems);
  document.getElementById('filterCategory').addEventListener('change', loadItems);

  document.getElementById('closeEditModal').addEventListener('click', closeModal);
  document.getElementById('cancelEditBtn').addEventListener('click', closeModal);
  document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

  document.getElementById('editModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});

function loadItems() {
  const search = document.getElementById('searchItems').value.trim();
  const category = document.getElementById('filterCategory').value;
  currentItems = DB.getAllItems(search, category);
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('itemsTableBody');
  const alertSuccess = document.getElementById('alertSuccess');
  const alertError = document.getElementById('alertError');
  alertSuccess.style.display = 'none';
  alertError.style.display = 'none';

  if (!currentItems.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No items found.</td></tr>';
    return;
  }

  tbody.innerHTML = currentItems.map((item, index) => {
    const statusBadge = getStatusBadge(item.quantity, item.lowThreshold);
    const expiry = item.expiryDate || '—';
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escHtml(item.name)}</strong></td>
        <td>${escHtml(item.category)}</td>
        <td>${item.quantity}</td>
        <td>${escHtml(item.unit || '—')}</td>
        <td>${escHtml(expiry)}</td>
        <td>${statusBadge}</td>
        <td>
          <button class="btn-edit" onclick="openEdit(${item.id})">Edit</button>
          <button class="btn-danger" onclick="deleteItem(${item.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadge(qty, threshold) {
  const low = threshold || 10;
  if (qty === 0) return '<span class="badge badge-critical">Out of Stock</span>';
  if (qty <= low) return '<span class="badge badge-low">Low Stock</span>';
  return '<span class="badge badge-ok">In Stock</span>';
}

function openEdit(id) {
  const item = DB.getItemById(id);
  if (!item) return;

  document.getElementById('editItemId').value = item.id;
  document.getElementById('editItemName').value = item.name;
  document.getElementById('editItemCategory').value = item.category;
  document.getElementById('editItemQty').value = item.quantity;
  document.getElementById('editItemUnit').value = item.unit || '';
  document.getElementById('editItemExpiry').value = item.expiryDate || '';
  document.getElementById('editItemThreshold').value = item.lowThreshold || 10;

  document.getElementById('editModal').classList.add('open');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('open');
}

function saveEdit() {
  const id = parseInt(document.getElementById('editItemId').value);
  const name = document.getElementById('editItemName').value.trim();
  const category = document.getElementById('editItemCategory').value;
  const quantity = parseInt(document.getElementById('editItemQty').value);
  const unit = document.getElementById('editItemUnit').value.trim();
  const expiryDate = document.getElementById('editItemExpiry').value;
  const lowThreshold = parseInt(document.getElementById('editItemThreshold').value) || 10;

  if (!name || !category || isNaN(quantity)) {
    alert('Please fill in required fields.');
    return;
  }

  DB.updateItem(id, { name, category, quantity, unit, expiryDate, description: '', lowThreshold });
  closeModal();

  const alertSuccess = document.getElementById('alertSuccess');
  alertSuccess.textContent = 'Item updated successfully!';
  alertSuccess.style.display = 'block';
  loadItems();
}

function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  DB.deleteItem(id);
  loadItems();
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
