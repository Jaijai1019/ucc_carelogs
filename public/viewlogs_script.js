<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CareLogs - View Logs</title>
  <link rel="stylesheet" href="global.css" />
  <link rel="stylesheet" href="dashboard_style.css" />
</head>
<body>
  <div class="app-wrapper">

    <nav class="sidebar" aria-label="Main navigation">
      <div class="sidebar-top">
        <div class="sidebar-logo">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/UCC%20Logo-kr2wTR4mmnqUjoqS9xzuqcCRRRaZj4.png" alt="UCC" />
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CSD%20Logo-jaXogTMhplm8CKCwXUlZvYjEFFWnIH.png" alt="CSD" />
        </div>
        <a href="dashboard.html" class="nav-item">Home</a>
        <a href="addstudent.html" class="nav-item">Add Student Log</a>
        <a href="additems.html" class="nav-item">Add Item</a>
        <a href="viewitems.html" class="nav-item">View Items</a>
        <a href="viewlogs.html" class="nav-item active">View Logs</a>
      </div>
      <div class="sidebar-bottom">
        <a href="login.html" id="logoutBtn" class="logout-btn">Log out</a>
      </div>
    </nav>

    <main class="main-content">
      <div class="top-bar">
        <div class="top-bar-left">
          <h1>Clinic <span>Logs</span></h1>
        </div>
        <div class="top-bar-right">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CareLogo-T6dnwpOU1LdcmRR7p6O9XKb653isPE.png" alt="CareLogs" />
        </div>
      </div>

      <div class="page-body">
        <div class="alert error" id="alertError">An error occurred. Please try again.</div>

        <div class="search-bar-wrap">
          <input class="search-input" id="searchLogs" type="search" placeholder="Search by name or ID..." />
          <input class="search-input" id="filterDate" type="date" style="max-width:200px;" title="Filter by date" />
          <a href="addstudent.html" class="btn-primary" style="padding:12px 24px; font-size:15px; border-radius:30px; text-decoration:none;">+ New Log</a>
        </div>

        <div class="table-box">
          <table class="data-table" aria-label="Clinic patient logs">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Course / Year</th>
                <th>Date</th>
                <th>Time</th>
                <th>Complaint</th>
                <th>Item Given</th>
                <th>Qty</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="logsTableBody">
              <tr>
                <td colspan="11" class="empty-state">No clinic logs recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>

  <div class="modal-overlay" id="viewModal" role="dialog" aria-modal="true" aria-labelledby="viewModalTitle">
    <div class="modal-box" style="width:560px;">
      <button class="modal-close" id="closeViewModal" aria-label="Close">&times;</button>
      <h2 class="modal-title" id="viewModalTitle">Log Details</h2>
      <div id="logDetailContent" style="font-size:15px; color:var(--dark); line-height:1.8;"></div>
      <div class="modal-footer" style="margin-top:20px;">
        <button class="btn-cancel" id="closeViewBtn">Close</button>
      </div>
    </div>
  </div>

  <script src="db.js"></script>
  <script src="viewlogs_script.js"></script>
</body>
</html>
