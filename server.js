const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'kodnest-internship-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ─── In-Memory Database ────────────────────────────────────────────────────────
let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      phone TEXT,
      college TEXT,
      cgpa REAL,
      skills TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT,
      stipend INTEGER,
      duration TEXT,
      domain TEXT,
      description TEXT,
      requirements TEXT,
      min_cgpa REAL DEFAULT 0,
      openings INTEGER DEFAULT 5,
      status TEXT DEFAULT 'active',
      posted_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      internship_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      cover_letter TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, internship_id)
    )
  `);

  // Insert sample data
  await seedData();
  console.log('✅ Database initialized with sample data');
}

async function seedData() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Admin user
  db.run(`INSERT OR IGNORE INTO users (name, email, password, role, phone, college) VALUES (?, ?, ?, ?, ?, ?)`,
    ['Admin User', 'admin@atme.com', adminPassword, 'admin', '9876543210', 'ATME Institute']);

  // Students
  const students = [
    ['Vikas', 'vikas@student.com', studentPassword, 'student', '9111111111', 'ATME College of Engineering', 7.8, 'Java, Python, React'],
    ['Vijay', 'vijay@student.com', studentPassword, 'student', '9222222222', 'ATME College of Engineering', 9.0, 'JavaScript, Node.js, MongoDB'],
    ['Puneeth', 'puneeth@student.com', studentPassword, 'student', '9333333333', 'ATME College of Engineering', 8.8, 'Python, ML, TensorFlow'],
    ['Ranjan', 'ranjan@student.com', studentPassword, 'student', '9444444444', 'ATME College of Engineering', 7.6, 'React, Angular, Vue.js'],
  ];

  for (const s of students) {
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role, phone, college, cgpa, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, s);
  }

  // Internships
  const internships = [
    ['Software Development Intern', 'Google India', 'Bangalore', 45000, '3 months', 'Full Stack', 'Work on cutting-edge web applications using modern tech stack. You will collaborate with senior engineers on real-world projects.', 'React, Node.js, Python', 8.6, 5],
    ['Data Science Intern', 'Microsoft', 'Hyderabad', 40000, '6 months', 'Data Science', 'Analyze large datasets and build ML models to drive business insights. Work with Azure ML and Power BI.', 'Python, ML, SQL, Power BI', 8.8, 3],
    ['UI/UX Design Intern', 'Adobe Systems', 'Noida', 35000, '3 months', 'Design', 'Create stunning user interfaces and design systems for enterprise products. Work with Figma and Adobe XD.', 'Figma, Adobe XD, CSS', 7.5, 4],
    ['Backend Engineering Intern', 'Flipkart', 'Bangalore', 50000, '4 months', 'Backend', 'Build scalable microservices and APIs serving millions of users. Work with Java Spring Boot and Kafka.', 'Java, Spring Boot, MySQL, Kafka', 8.5, 6],
    ['DevOps Intern', 'Amazon AWS', 'Chennai', 42000, '6 months', 'DevOps', 'Manage cloud infrastructure and CI/CD pipelines on AWS. Work on automation and infrastructure as code.', 'AWS, Docker, Kubernetes, Terraform', 8.2, 3],
    ['Mobile App Intern', 'Paytm', 'Noida', 30000, '3 months', 'Mobile', 'Develop features for Paytm mobile application used by 100M+ users. Work with React Native and Flutter.', 'React Native, Flutter, APIs', 7.6, 5],
    ['Cybersecurity Intern', 'Wipro', 'Pune', 28000, '6 months', 'Security', 'Perform security audits, penetration testing, and vulnerability assessments for enterprise clients.', 'Network Security, Python, OWASP', 7.0, 4],
    ['AI/ML Intern', 'TCS Research', 'Mumbai', 38000, '4 months', 'AI/ML', 'Research and develop AI solutions for industrial applications. Work with cutting-edge LLMs and generative AI.', 'Python, PyTorch, NLP, LLMs', 8.7, 3],
  ];

  for (const intern of internships) {
    db.run(`INSERT OR IGNORE INTO internships (title, company, location, stipend, duration, domain, description, requirements, min_cgpa, openings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, intern);
  }

  // Sample applications
  const apps = [
    [2, 1, 'applied'], [2, 2, 'shortlisted'], [3, 1, 'applied'], [3, 5, 'selected'],
    [4, 3, 'applied'], [4, 4, 'rejected'], [5, 6, 'applied'], [5, 7, 'shortlisted'],
  ];
  for (const a of apps) {
    db.run(`INSERT OR IGNORE INTO applications (user_id, internship_id, status) VALUES (?, ?, ?)`, a);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  const result = [];
  stmt.bind(params);
  while (stmt.step()) result.push(stmt.getAsObject());
  stmt.free();
  return result;
}

function dbGet(sql, params = []) {
  return dbAll(sql, params)[0] || null;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  const lastRow = dbGet('SELECT last_insert_rowid() as id');
  return lastRow ? lastRow.id : null;
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, college, cgpa, skills } = req.body;
    if (!name || !email || !password) return res.json({ success: false, message: 'Name, email and password are required' });
    const existing = dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.json({ success: false, message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const id = dbRun('INSERT INTO users (name, email, password, role, phone, college, cgpa, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashed, 'student', phone || null, college || null, cgpa || null, skills || null]);
    const user = dbGet('SELECT id, name, email, role, phone, college, cgpa, skills FROM users WHERE id = ?', [id]);
    req.session.user = user;
    res.json({ success: true, user, message: 'Registration successful!' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Email and password required' });
    const user = dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Invalid credentials' });
    const { password: _, ...safeUser } = user;
    req.session.user = safeUser;
    res.json({ success: true, user: safeUser, message: 'Login successful!' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out' });
});

// Auth: Session
app.get('/api/auth/session', (req, res) => {
  res.json({ success: true, user: req.session.user || null });
});

// Internships: List (with search/filter)
app.get('/api/internships', (req, res) => {
  const { search, domain, location, page = 1, limit = 6 } = req.query;
  let sql = 'SELECT * FROM internships WHERE status = "active"';
  const params = [];
  if (search) { sql += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  if (domain) { sql += ' AND domain = ?'; params.push(domain); }
  if (location) { sql += ' AND location LIKE ?'; params.push(`%${location}%`); }
  const total = dbGet(`SELECT COUNT(*) as count FROM (${sql})`, params)?.count || 0;
  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  const internships = dbAll(sql, params);
  res.json({ success: true, internships, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
});

// Internships: Single
app.get('/api/internships/:id', (req, res) => {
  const internship = dbGet('SELECT * FROM internships WHERE id = ?', [req.params.id]);
  if (!internship) return res.json({ success: false, message: 'Not found' });
  res.json({ success: true, internship });
});

// Internships: CGPA-based recommendations for logged-in students
app.get('/api/recommendations', requireAuth, (req, res) => {
  if (req.session.user.role !== 'student') return res.json({ success: true, internships: [] });
  const user = dbGet('SELECT cgpa FROM users WHERE id = ?', [req.session.user.id]);
  const cgpa = Number(user?.cgpa || 0);
  const internships = dbAll(`
    SELECT *,
      CASE
        WHEN ? >= min_cgpa THEN 100 - ((? - min_cgpa) * 5)
        ELSE 0
      END AS match_score
    FROM internships
    WHERE status = "active" AND min_cgpa <= ?
    ORDER BY match_score DESC, min_cgpa DESC, stipend DESC
    LIMIT 6
  `, [cgpa, cgpa, cgpa]);

  res.json({ success: true, cgpa, internships });
});

// Internships: Create (admin)
app.post('/api/internships', requireAdmin, (req, res) => {
  const { title, company, location, stipend, duration, domain, description, requirements, openings } = req.body;
  if (!title || !company) return res.json({ success: false, message: 'Title and company required' });
  const id = dbRun('INSERT INTO internships (title, company, location, stipend, duration, domain, description, requirements, openings, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, company, location, stipend, duration, domain, description, requirements, openings || 5, req.session.user.id]);
  const internship = dbGet('SELECT * FROM internships WHERE id = ?', [id]);
  res.json({ success: true, internship, message: 'Internship created!' });
});

// Internships: Update (admin)
app.put('/api/internships/:id', requireAdmin, (req, res) => {
  const { title, company, location, stipend, duration, domain, description, requirements, openings, status } = req.body;
  dbRun('UPDATE internships SET title=?, company=?, location=?, stipend=?, duration=?, domain=?, description=?, requirements=?, openings=?, status=? WHERE id=?',
    [title, company, location, stipend, duration, domain, description, requirements, openings, status || 'active', req.params.id]);
  res.json({ success: true, message: 'Internship updated!' });
});

// Internships: Delete (admin)
app.delete('/api/internships/:id', requireAdmin, (req, res) => {
  dbRun('DELETE FROM internships WHERE id = ?', [req.params.id]);
  dbRun('DELETE FROM applications WHERE internship_id = ?', [req.params.id]);
  res.json({ success: true, message: 'Internship deleted!' });
});

// Applications: Apply
app.post('/api/applications/apply', requireAuth, (req, res) => {
  const { internship_id, cover_letter } = req.body;
  const existing = dbGet('SELECT id FROM applications WHERE user_id = ? AND internship_id = ?', [req.session.user.id, internship_id]);
  if (existing) return res.json({ success: false, message: 'You have already applied for this internship' });
  const id = dbRun('INSERT INTO applications (user_id, internship_id, cover_letter, status) VALUES (?, ?, ?, "applied")',
    [req.session.user.id, internship_id, cover_letter || null]);
  res.json({ success: true, id, message: 'Application submitted successfully!' });
});

// Applications: My applications
app.get('/api/applications/mine', requireAuth, (req, res) => {
  const apps = dbAll(`SELECT a.*, i.title, i.company, i.location, i.stipend, i.duration, i.domain
    FROM applications a JOIN internships i ON a.internship_id = i.id
    WHERE a.user_id = ? ORDER BY a.applied_at DESC`, [req.session.user.id]);
  res.json({ success: true, applications: apps });
});

// Applications: All (admin)
app.get('/api/applications', requireAdmin, (req, res) => {
  const { page = 1, status, internship_id } = req.query;
  let sql = `SELECT a.*, u.name as student_name, u.email as student_email, u.college,
    i.title as internship_title, i.company
    FROM applications a JOIN users u ON a.user_id = u.id JOIN internships i ON a.internship_id = i.id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND a.status = ?'; params.push(status); }
  if (internship_id) { sql += ' AND a.internship_id = ?'; params.push(internship_id); }
  const total = dbGet(`SELECT COUNT(*) as count FROM (${sql})`, params)?.count || 0;
  sql += ` ORDER BY a.applied_at DESC LIMIT 10 OFFSET ?`;
  params.push((parseInt(page) - 1) * 10);
  const apps = dbAll(sql, params);
  res.json({ success: true, applications: apps, total, totalPages: Math.ceil(total / 10) });
});

// Applications: Update status (admin)
app.put('/api/applications/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  dbRun('UPDATE applications SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [status, req.params.id]);
  res.json({ success: true, message: `Application marked as ${status}` });
});

// Users: All (admin)
app.get('/api/users', requireAdmin, (req, res) => {
  const { page = 1, search } = req.query;
  let sql = 'SELECT id, name, email, role, phone, college, cgpa, skills, created_at FROM users WHERE role = "student"';
  const params = [];
  if (search) { sql += ' AND (name LIKE ? OR email LIKE ? OR college LIKE ?)'; const s = `%${search}%`; params.push(s, s, s); }
  const total = dbGet(`SELECT COUNT(*) as count FROM (${sql})`, params)?.count || 0;
  sql += ' ORDER BY created_at DESC LIMIT 10 OFFSET ?';
  params.push((parseInt(page) - 1) * 10);
  const users = dbAll(sql, params);
  res.json({ success: true, users, total, totalPages: Math.ceil(total / 10) });
});

// Stats (admin dashboard)
app.get('/api/stats', requireAdmin, (req, res) => {
  const totalStudents = dbGet('SELECT COUNT(*) as count FROM users WHERE role="student"')?.count || 0;
  const totalInternships = dbGet('SELECT COUNT(*) as count FROM internships WHERE status="active"')?.count || 0;
  const totalApplications = dbGet('SELECT COUNT(*) as count FROM applications')?.count || 0;
  const pendingApplications = dbGet('SELECT COUNT(*) as count FROM applications WHERE status="applied"')?.count || 0;
  const selectedApplications = dbGet('SELECT COUNT(*) as count FROM applications WHERE status="selected"')?.count || 0;
  const recentApps = dbAll(`SELECT a.*, u.name as student_name, i.title, i.company
    FROM applications a JOIN users u ON a.user_id=u.id JOIN internships i ON a.internship_id=i.id
    ORDER BY a.applied_at DESC LIMIT 5`);
  const domainStats = dbAll('SELECT domain, COUNT(*) as count FROM internships GROUP BY domain ORDER BY count DESC');
  res.json({ success: true, stats: { totalStudents, totalInternships, totalApplications, pendingApplications, selectedApplications }, recentApps, domainStats });
});

// Student stats
app.get('/api/stats/student', requireAuth, (req, res) => {
  const uid = req.session.user.id;
  const total = dbGet('SELECT COUNT(*) as count FROM applications WHERE user_id=?', [uid])?.count || 0;
  const pending = dbGet('SELECT COUNT(*) as count FROM applications WHERE user_id=? AND status="applied"', [uid])?.count || 0;
  const shortlisted = dbGet('SELECT COUNT(*) as count FROM applications WHERE user_id=? AND status="shortlisted"', [uid])?.count || 0;
  const selected = dbGet('SELECT COUNT(*) as count FROM applications WHERE user_id=? AND status="selected"', [uid])?.count || 0;
  res.json({ success: true, stats: { total, pending, shortlisted, selected } });
});

// Profile update
app.put('/api/profile', requireAuth, async (req, res) => {
  const { name, phone, college, cgpa, skills } = req.body;
  dbRun('UPDATE users SET name=?, phone=?, college=?, cgpa=?, skills=? WHERE id=?',
    [name, phone, college, cgpa, skills, req.session.user.id]);
  const updated = dbGet('SELECT id, name, email, role, phone, college, cgpa, skills FROM users WHERE id=?', [req.session.user.id]);
  req.session.user = updated;
  res.json({ success: true, user: updated, message: 'Profile updated!' });
});

// ─── Static SPA Catch-all ─────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\nCampus2Career running!`);
    console.log(`🌐 Open: http://localhost:${PORT}`);
    console.log(`\n📋 Demo Accounts:`);
    console.log(`   Admin:   admin@atme.com        / admin123`);
    console.log(`   Student: vikas@student.com      / student123`);
  });
}).catch(console.error);
