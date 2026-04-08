(function () {
  'use strict';

  const DB_KEY = 'carelogs_db';

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
  script.onload = initDB;
  document.head.appendChild(script);

  let db = null;
  let _resolvers = [];
  let _ready = false;

  function initDB() {
    const config = {
      locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.wasm'
    };

    initSqlJs(config).then(function (SQL) {
      const savedDB = localStorage.getItem(DB_KEY);
      if (savedDB) {
        const binary = Uint8Array.from(atob(savedDB), c => c.charCodeAt(0));
        db = new SQL.Database(binary);
      } else {
        db = new SQL.Database();
      }

      createTables();
      _ready = true;
      
      _resolvers.forEach(fn => fn());
      _resolvers = [];

      document.dispatchEvent(new Event('db:ready'));
    }).catch(err => console.error('[CareLogs DB] Init error:', err));
  }

  function createTables() {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName  TEXT NOT NULL,
        email     TEXT UNIQUE NOT NULL,
        password  TEXT NOT NULL,
        position  TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS inventory (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        name         TEXT NOT NULL,
        category     TEXT NOT NULL,
        quantity     INTEGER NOT NULL DEFAULT 0,
        unit         TEXT DEFAULT '',
        expiryDate   TEXT DEFAULT '',
        description  TEXT DEFAULT '',
        lowThreshold INTEGER DEFAULT 10,
        createdAt    TEXT DEFAULT (datetime('now'))
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS clinic_logs (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName    TEXT NOT NULL,
        lastName     TEXT NOT NULL,
        studentID    TEXT NOT NULL,
        course       TEXT NOT NULL,
        gender       TEXT DEFAULT '',
        visitDate    TEXT NOT NULL,
        visitTime    TEXT DEFAULT '',
        complaint    TEXT DEFAULT '',
        itemId       INTEGER DEFAULT NULL,
        itemName     TEXT DEFAULT '',
        quantityGiven INTEGER DEFAULT 0,
        notes        TEXT DEFAULT '',
        recordedBy   TEXT DEFAULT '',
        createdAt    TEXT DEFAULT (datetime('now'))
      );
    `);

    save();
  }

  function save() {
    if (!db) return;
    const data = db.export();
    const base64 = btoa(String.fromCharCode.apply(null, data));
    localStorage.setItem(DB_KEY, base64);
  }

  function ready(fn) {
    if (_ready) {
      fn();
    } else {
      _resolvers.push(fn);
    }
  }

  const DB = {


    registerUser(firstName, lastName, email, password, position) {
      const exists = db.exec(
        `SELECT id FROM users WHERE email = ?`, [email]
      );
      if (exists.length && exists[0].values.length) {
        return { success: false, message: 'Email already registered.' };
      }
      db.run(
        `INSERT INTO users (firstName, lastName, email, password, position) VALUES (?,?,?,?,?)`,
        [firstName, lastName, email, password, position]
      );
      save();
      return { success: true };
    },

    loginUser(email, password, position) {
      const result = db.exec(
        `SELECT id, firstName, lastName, position FROM users WHERE email=? AND password=? AND position=?`,
        [email, password, position]
      );
      if (result.length && result[0].values.length) {
        const row = result[0].values[0];
        const user = { id: row[0], firstName: row[1], lastName: row[2], position: row[3] };
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
      }
      return { success: false, message: 'Invalid credentials or position.' };
    },

    getCurrentUser() {
      const raw = sessionStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    },

    logout() {
      sessionStorage.removeItem('currentUser');
    },

    addItem(item) {
      db.run(
        `INSERT INTO inventory (name, category, quantity, unit, expiryDate, description, lowThreshold)
         VALUES (?,?,?,?,?,?,?)`,
        [item.name, item.category, item.quantity, item.unit || '', item.expiryDate || '',
         item.description || '', item.lowThreshold || 10]
      );
      save();
    },

    getAllItems(search, category) {
      let sql = `SELECT * FROM inventory WHERE 1=1`;
      const params = [];
      if (search) {
        sql += ` AND (name LIKE ? OR category LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
      }
      if (category) {
        sql += ` AND category = ?`;
        params.push(category);
      }
      sql += ` ORDER BY createdAt DESC`;
      return queryToObjects(db.exec(sql, params));
    },

    getItemById(id) {
      return queryToObjects(db.exec(`SELECT * FROM inventory WHERE id=?`, [id]))[0] || null;
    },

    updateItem(id, item) {
      db.run(
        `UPDATE inventory SET name=?, category=?, quantity=?, unit=?, expiryDate=?, description=?, lowThreshold=? WHERE id=?`,
        [item.name, item.category, item.quantity, item.unit, item.expiryDate, item.description, item.lowThreshold, id]
      );
      save();
    },

    deleteItem(id) {
      db.run(`DELETE FROM inventory WHERE id=?`, [id]);
      save();
    },

    getTotalItems() {
      const r = db.exec(`SELECT COUNT(*) FROM inventory`);
      return r.length ? r[0].values[0][0] : 0;
    },

    decrementItemQuantity(id, qty) {
      db.run(`UPDATE inventory SET quantity = MAX(0, quantity - ?) WHERE id=?`, [qty, id]);
      save();
    },

    getItemsForSelect() {
      return queryToObjects(db.exec(`SELECT id, name, quantity, unit FROM inventory WHERE quantity > 0 ORDER BY name`));
    },

    addLog(log) {
      db.run(
        `INSERT INTO clinic_logs
         (firstName, lastName, studentID, course, gender, visitDate, visitTime, complaint, itemId, itemName, quantityGiven, notes, recordedBy)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [log.firstName, log.lastName, log.studentID, log.course, log.gender || '',
         log.visitDate, log.visitTime || '', log.complaint || '',
         log.itemId || null, log.itemName || '', log.quantityGiven || 0,
         log.notes || '', log.recordedBy || '']
      );
      save();
    },

    getAllLogs(search, date) {
      let sql = `SELECT * FROM clinic_logs WHERE 1=1`;
      const params = [];
      if (search) {
        sql += ` AND (firstName LIKE ? OR lastName LIKE ? OR studentID LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (date) {
        sql += ` AND visitDate = ?`;
        params.push(date);
      }
      sql += ` ORDER BY visitDate DESC, createdAt DESC`;
      return queryToObjects(db.exec(sql, params));
    },

    getLogById(id) {
      return queryToObjects(db.exec(`SELECT * FROM clinic_logs WHERE id=?`, [id]))[0] || null;
    },

    deleteLog(id) {
      db.run(`DELETE FROM clinic_logs WHERE id=?`, [id]);
      save();
    },

    getTotalPatients() {
      const r = db.exec(`SELECT COUNT(DISTINCT studentID) FROM clinic_logs`);
      return r.length ? r[0].values[0][0] : 0;
    },

    getLogsToday() {
      const today = new Date().toISOString().split('T')[0];
      const r = db.exec(`SELECT COUNT(*) FROM clinic_logs WHERE visitDate=?`, [today]);
      return r.length ? r[0].values[0][0] : 0;
    },

    getRecentLogs(limit) {
      return queryToObjects(
        db.exec(`SELECT * FROM clinic_logs ORDER BY visitDate DESC, createdAt DESC LIMIT ?`, [limit || 10])
      );
    },

    ready
  };

  function queryToObjects(results) {
    if (!results || !results.length) return [];
    const cols = results[0].columns;
    return results[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  window.DB = DB;
})();
