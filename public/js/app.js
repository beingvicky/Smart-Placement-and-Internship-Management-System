/* ═══════════════════════════════════════════════════════════════════════
   Campus2Career v2 - Frontend Application
   Premium SPA Router + Redesigned Page Renderers
═══════════════════════════════════════════════════════════════════════ */

// ─── State ────────────────────────────────────────────────────────────
let currentUser = null;
let currentPage = 'home';
let applyingToId = null;
let internshipPage = 1;
let internshipSearch = '';
let internshipDomain = '';
let appliedIdsCached = new Set();

// ─── Boot ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await checkSession();
  setupScrollListener();
  navigate(getRouteFromHash() || 'home');
});

function getRouteFromHash() {
  const hash = location.hash.replace('#', '');
  const valid = ['home','internships','login','register','dashboard','applications','admin','profile'];
  return valid.includes(hash) ? hash : null;
}

async function checkSession() {
  try {
    const res = await api.get('/api/auth/session');
    if (res.user) { currentUser = res.user; updateNav(); }
  } catch(e) {}
}

// ─── Nav Update ────────────────────────────────────────────────────────
function updateNav() {
  const li = !!currentUser, isAdmin = currentUser?.role === 'admin';
  document.getElementById('nav-login-li').style.display    = li ? 'none' : '';
  document.getElementById('nav-register-li').style.display = li ? 'none' : '';
  document.getElementById('nav-user-li').style.display     = li ? '' : 'none';
  document.getElementById('nav-dashboard-li').style.display   = li ? '' : 'none';
  document.getElementById('nav-applications-li').style.display = (li && !isAdmin) ? '' : 'none';
  document.getElementById('nav-admin-li').style.display    = isAdmin ? '' : 'none';
  if (currentUser) {
    document.getElementById('navUserName').textContent   = currentUser.name.split(' ')[0];
    document.getElementById('navUserAvatar').textContent = currentUser.name[0].toUpperCase();
  }
}

function setupScrollListener() {
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

function setActiveNav(page) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active-link'));
  const el = document.getElementById(`nav-${page}`);
  if (el) el.classList.add('active-link');
}

// ─── Router ────────────────────────────────────────────────────────────
function navigate(page, params = {}) {
  const guarded = ['dashboard','applications','profile'];
  const adminGuarded = ['admin'];
  if (guarded.includes(page) && !currentUser) { navigate('login'); return; }
  if (adminGuarded.includes(page) && currentUser?.role !== 'admin') { navigate('home'); return; }
  if (['login','register'].includes(page) && currentUser) {
    navigate(currentUser.role === 'admin' ? 'admin' : 'dashboard'); return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) { el.innerHTML = ''; el.classList.add('active'); }
  currentPage = page;
  location.hash = page;
  setActiveNav(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const renderers = { home: renderHome, internships: renderInternships, login: renderLogin,
    register: renderRegister, dashboard: renderDashboard, applications: renderApplications,
    admin: renderAdmin, profile: renderProfile };
  if (renderers[page]) renderers[page](params);
}

// ─── API Client ────────────────────────────────────────────────────────
const api = {
  async request(method, url, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.json();
  },
  get:    url       => api.request('GET',    url),
  post:   (url, b)  => api.request('POST',   url, b),
  put:    (url, b)  => api.request('PUT',    url, b),
  delete: url       => api.request('DELETE', url),
};

// ─── Toast ─────────────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const t = document.createElement('div');
  t.className = `toast-msg toast-${type}`;
  t.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ─── Utility Helpers ───────────────────────────────────────────────────
function fmtStipend(s) { return s ? `₹${(+s).toLocaleString('en-IN')}/mo` : 'Unpaid'; }
function domainIcon(d) {
  const map = { 'Full Stack':'🌐','Data Science':'📊','AI/ML':'🤖','Backend':'⚙️',
    'Frontend':'🎨','Mobile':'📱','DevOps':'☁️','Design':'✏️','Security':'🔒','Other':'💼' };
  return map[d] || '💼';
}
function companyInitials(c = 'X') { return (c[0] || 'X').toUpperCase(); }
function statusBadge(s) { return `<span class="status-badge status-${s}">${s}</span>`; }
function timeAgo(dt) {
  if (!dt) return '';
  const d = Math.floor((Date.now() - new Date(dt).getTime()) / 86400000);
  if (d === 0) return 'Today'; if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`; if (d < 30) return `${Math.floor(d/7)}w ago`;
  return `${Math.floor(d/30)}mo ago`;
}

// Company color palettes for logo boxes
const companyColors = [
  ['#6366f1','#4f46e5'],['#8b5cf6','#7c3aed'],['#06b6d4','#0891b2'],
  ['#10b981','#059669'],['#f59e0b','#d97706'],['#ef4444','#dc2626'],
  ['#ec4899','#db2777'],['#14b8a6','#0d9488'],
];
function companyGrad(name = '') {
  const idx = (name.charCodeAt(0) || 0) % companyColors.length;
  const [a, b] = companyColors[idx];
  return `linear-gradient(135deg,${a},${b})`;
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE RENDERERS
// ═══════════════════════════════════════════════════════════════════════

// ─── HOME ─────────────────────────────────────────────────────────────
function renderHome() {
  document.getElementById('page-home').innerHTML = `

    <!-- HERO -->
    <section class="hero-section">
      <div class="hero-bg-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="container">
        <div class="row align-items-center gy-5">

          <!-- Left Column -->
          <div class="col-lg-6 hero-content">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              India's #1 Internship Platform
            </div>
            <h1 class="hero-title">
              Launch Your Career with
              <span class="line-gradient">Top Internships</span>
            </h1>
            <p class="hero-desc">
              Connect with 500+ verified companies, apply in seconds, and track every step of your placement journey — all in one smart platform.
            </p>
            <div class="hero-actions">
              <button class="btn btn-gradient btn-lg px-4" onclick="navigate('internships')">
                <i class="fas fa-search me-2"></i>Browse Internships
              </button>
              ${!currentUser
                ? `<button class="btn btn-outline-glass btn-lg px-4" onclick="navigate('register')"><i class="fas fa-user-plus me-2"></i>Join Free</button>`
                : `<button class="btn btn-outline-glass btn-lg px-4" onclick="navigate('dashboard')"><i class="fas fa-chart-line me-2"></i>My Dashboard</button>`}
            </div>
            <div class="hero-stats">
              <div class="hero-stat"><span class="hero-stat-num">500+</span><span class="hero-stat-label">Companies</span></div>
              <div class="hero-stat-sep"></div>
              <div class="hero-stat"><span class="hero-stat-num">10K+</span><span class="hero-stat-label">Students Placed</span></div>
              <div class="hero-stat-sep"></div>
              <div class="hero-stat"><span class="hero-stat-num">₹45K</span><span class="hero-stat-label">Avg Stipend</span></div>
            </div>
          </div>

          <!-- Right Column – Hero Image -->
          <div class="col-lg-6 d-none d-lg-block">
            <div class="hero-visual-wrap">
              <div class="hero-img-wrapper">
                <img src="/images/hero.png" alt="Students finding internships on Campus2Career" />
                <div class="hero-img-overlay"></div>
              </div>
              <div class="hero-float-card hero-float-card-1">
                <span class="fc-icon">🎉</span>
                <div><div>Application Sent!</div><span class="fc-label">Google India · Just now</span></div>
              </div>
              <div class="hero-float-card hero-float-card-2">
                <span class="fc-icon">⭐</span>
                <div><div>You're Shortlisted!</div><span class="fc-label">Microsoft · 2 hrs ago</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY CAMPUS2CAREER -->
    <section style="padding:80px 0 60px;">
      <div class="container">
        <div class="text-center mb-5">
          <span class="eyebrow">Why Campus2Career</span>
          <h2 class="section-title">Everything you need to<br>land your dream internship</h2>
        </div>
        <div class="row g-4">
          ${[
            ['fas fa-bolt','Instant Apply','One-click application with personalised cover letter. Get noticed by top companies instantly.'],
            ['fas fa-chart-bar','Track Progress','Real-time status updates — pending, shortlisted, or selected. Never miss an update.'],
            ['fas fa-shield-alt','Verified Companies','Every company is verified. No spam, no fake listings, no wasted time.'],
            ['fas fa-brain','Smart Matching','Profile-based recommendations surfacing the roles where you have the best chance.'],
            ['fas fa-mobile-alt','Mobile First','Access internships on any device with a fully responsive, touch-optimised interface.'],
            ['fas fa-graduation-cap','Placement Support','Dedicated placement-cell integration for colleges and verified student credentials.'],
          ].map(([icon, title, desc]) => `
            <div class="col-md-4">
              <div class="feature-card">
                <div class="feature-icon"><i class="${icon}"></i></div>
                <h4>${title}</h4>
                <p>${desc}</p>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- FEATURED INTERNSHIPS -->
    <section style="padding:0 0 80px;">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-5">
          <div>
            <span class="eyebrow">Featured Opportunities</span>
            <h2 class="section-title mb-0">Hot Internships This Week</h2>
          </div>
          <button class="btn btn-outline-glass" onclick="navigate('internships')">
            View All <i class="fas fa-arrow-right ms-2"></i>
          </button>
        </div>
        <div class="row g-4" id="homeInternships">
          <div class="col-12"><div class="loader-wrap"><div class="spinner"></div><p style="margin:0;font-size:.9rem;">Loading internships…</p></div></div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    ${!currentUser ? `
    <section style="padding:0 0 80px;">
      <div class="container">
        <div class="cta-section">
          <span class="eyebrow" style="justify-content:center;display:block;">Start Today</span>
          <h2>Ready to launch<br>your career?</h2>
          <p>Join thousands of students who found their dream internship through Campus2Career. It's free, fast, and built for students like you.</p>
          <button class="btn btn-gradient btn-lg px-5" onclick="navigate('register')">
            <i class="fas fa-rocket me-2"></i>Get Started — It's Free
          </button>
        </div>
      </div>
    </section>` : ''}

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="footer-brand-text">Campus<span class="brand-accent">2Career</span></div>
            <p class="footer-desc">India's smartest internship and placement management platform for students and companies.</p>
          </div>
          <div class="col-md-2">
            <div class="footer-heading">Platform</div>
            <a href="#" class="footer-link" onclick="navigate('internships')">Internships</a>
            <a href="#" class="footer-link" onclick="navigate('dashboard')">Dashboard</a>
            <a href="#" class="footer-link" onclick="navigate('applications')">Applications</a>
          </div>
          <div class="col-md-2">
            <div class="footer-heading">Company</div>
            <a href="#" class="footer-link">About Us</a>
            <a href="#" class="footer-link">Blog</a>
            <a href="#" class="footer-link">Careers</a>
          </div>
          <div class="col-md-4">
            <div class="footer-heading">Demo Credentials</div>
            <div class="footer-creds">
              <div><strong>Admin:</strong> admin@atme.com / admin123</div>
              <div><span class="dc-student"><strong>Student:</strong> vikas@student.com / student123</span></div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">© 2024 Campus2Career - Built for students</div>
      </div>
    </footer>
  `;
  loadHomeInternships();
}

async function loadHomeInternships() {
  const res = await api.get('/api/internships?limit=6');
  const el = document.getElementById('homeInternships');
  if (!el) return;
  if (!res.internships?.length) {
    el.innerHTML = emptyState('No internships yet', 'Check back soon!');
    return;
  }
  if (currentUser && currentUser.role !== 'admin') {
    const ar = await api.get('/api/applications/mine');
    appliedIdsCached = new Set((ar.applications || []).map(a => a.internship_id));
  }
  el.innerHTML = res.internships.map(i => internshipCardHtml(i)).join('');
}

// ─── INTERNSHIP CARD HTML ──────────────────────────────────────────────
function internshipCardHtml(i) {
  const applied = appliedIdsCached.has(i.id);
  const grad = companyGrad(i.company);
  return `
    <div class="col-md-6 col-xl-4">
      <div class="glass-card internship-card h-100 d-flex flex-column" onclick="showInternshipDetail(${i.id}, '${encodeURIComponent(JSON.stringify(i))}')">
        ${applied ? `<div class="applied-badge"><i class="fas fa-check me-1"></i>Applied</div>` : ''}
        <div class="d-flex align-items-start gap-3 mb-3">
          <div class="company-thumb company-thumb-placeholder" style="background:${grad};">
            <span style="font-size:1.05rem;font-weight:800;color:white;">${companyInitials(i.company)}</span>
          </div>
          <div style="min-width:0;">
            <div class="card-company-name">${i.company}</div>
            <div class="card-job-title">${i.title}</div>
          </div>
        </div>
        <div class="chip-row">
          ${i.location  ? `<span class="chip"><i class="fas fa-map-marker-alt"></i>${i.location}</span>` : ''}
          ${i.duration  ? `<span class="chip"><i class="fas fa-clock"></i>${i.duration}</span>` : ''}
          ${i.openings  ? `<span class="chip"><i class="fas fa-users"></i>${i.openings} openings</span>` : ''}
          ${i.min_cgpa ? `<span class="chip"><i class="fas fa-graduation-cap"></i>CGPA ${Number(i.min_cgpa).toFixed(1)}+</span>` : ''}
        </div>
        <div class="card-footer-row mt-auto">
          <span class="stipend-text">${fmtStipend(i.stipend)}</span>
          <span class="domain-pill">${domainIcon(i.domain)} ${i.domain || 'Other'}</span>
        </div>
      </div>
    </div>`;
}

// ─── INTERNSHIPS PAGE ─────────────────────────────────────────────────
function renderInternships(params = {}) {
  internshipPage  = params.page   || 1;
  internshipSearch = params.search || '';
  internshipDomain = params.domain || '';

  document.getElementById('page-internships').innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb-row">
          <span class="bc-active">Campus2Career</span>
          <i class="fas fa-chevron-right"></i>
          <span>Internships</span>
        </div>
        <h1>Find Your Perfect Internship</h1>
        <p style="color:var(--text-300);margin-top:8px;font-size:.97rem;">Browse opportunities from verified top companies across India</p>
      </div>
    </div>
    <div class="container">
      <!-- Filter Bar -->
      <div class="filter-bar mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-5">
            <label class="form-label">Search Internships</label>
            <div class="input-icon-wrap">
              <i class="fas fa-search ii-icon"></i>
              <input type="text" id="searchInput" class="form-control glass-input"
                placeholder="Role, company, or keyword…" value="${internshipSearch}"
                oninput="debounceSearch()" />
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Domain</label>
            <select id="domainFilter" class="form-control glass-input" onchange="filterByDomain()">
              <option value="">All Domains</option>
              ${['Full Stack','Data Science','AI/ML','Backend','Frontend','Mobile','DevOps','Design','Security']
                .map(d => `<option ${internshipDomain===d?'selected':''}>${d}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-gradient w-100" onclick="filterInternships()"><i class="fas fa-search me-2"></i>Search</button>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-glass w-100" onclick="clearFilters()"><i class="fas fa-times me-2"></i>Clear</button>
          </div>
        </div>
      </div>
      <!-- Grid -->
      <div id="internResults"><div class="loader-wrap"><div class="spinner"></div></div></div>
      <div id="pagination" class="pagination-wrap"></div>
    </div>`;
  loadInternships();
}

let _searchTimer;
function debounceSearch() { clearTimeout(_searchTimer); _searchTimer = setTimeout(filterInternships, 420); }
function filterByDomain() { internshipDomain = document.getElementById('domainFilter')?.value || ''; internshipPage = 1; loadInternships(); }
function filterInternships() {
  internshipSearch = document.getElementById('searchInput')?.value || '';
  internshipDomain = document.getElementById('domainFilter')?.value || '';
  internshipPage = 1; loadInternships();
}
function clearFilters() {
  internshipSearch = ''; internshipDomain = ''; internshipPage = 1;
  const si = document.getElementById('searchInput'), df = document.getElementById('domainFilter');
  if (si) si.value = ''; if (df) df.value = '';
  loadInternships();
}

async function loadInternships() {
  const el = document.getElementById('internResults');
  if (!el) return;
  el.innerHTML = `<div class="loader-wrap"><div class="spinner"></div><p style="margin:0;font-size:.9rem;">Loading…</p></div>`;

  if (currentUser && currentUser.role !== 'admin') {
    const ar = await api.get('/api/applications/mine');
    appliedIdsCached = new Set((ar.applications || []).map(a => a.internship_id));
  }

  let url = `/api/internships?page=${internshipPage}&limit=9`;
  if (internshipSearch) url += `&search=${encodeURIComponent(internshipSearch)}`;
  if (internshipDomain) url += `&domain=${encodeURIComponent(internshipDomain)}`;

  const res = await api.get(url);
  if (!res.internships?.length) {
    el.innerHTML = `<div class="empty-state">
      <img src="/images/empty-state.png" alt="No results" />
      <p>No internships found. Try different filters.</p>
      <button class="btn btn-gradient" onclick="clearFilters()">Clear Filters</button>
    </div>`;
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  el.innerHTML = `<div class="row g-4">${res.internships.map(internshipCardHtml).join('')}</div>`;
  renderPagination(res.page, res.totalPages);
}

function renderPagination(page, total) {
  const el = document.getElementById('pagination');
  if (!el || total <= 1) { if (el) el.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="goPage(${page-1})" ${page===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= total; i++)
    html += `<button class="page-btn ${i===page?'active':''}" onclick="goPage(${i})">${i}</button>`;
  html += `<button class="page-btn" onclick="goPage(${page+1})" ${page===total?'disabled':''}><i class="fas fa-chevron-right"></i></button>`;
  el.innerHTML = html;
}
function goPage(p) { internshipPage = p; loadInternships(); window.scrollTo({ top: 280, behavior: 'smooth' }); }

// ─── Internship Detail Modal ───────────────────────────────────────────
function showInternshipDetail(id, encoded) {
  const i = JSON.parse(decodeURIComponent(encoded));
  const applied = appliedIdsCached.has(i.id) || currentUser?.role === 'admin';
  const grad = companyGrad(i.company);
  document.getElementById('internshipModalContent').innerHTML = `
    <div class="modal-header border-0" style="padding:28px 32px 0;">
      <div class="d-flex align-items-start gap-3 flex-grow-1">
        <div class="company-thumb company-thumb-placeholder" style="width:56px;height:56px;border-radius:14px;background:${grad};flex-shrink:0;">
          <span style="font-size:1.2rem;font-weight:800;color:white;">${companyInitials(i.company)}</span>
        </div>
        <div>
          <h5 class="fw-700 mb-1" style="font-size:1.15rem;">${i.title}</h5>
          <div style="color:var(--text-400);font-size:.87rem;">${i.company} · ${i.location || 'Remote'}</div>
        </div>
      </div>
      <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
    </div>
    <div class="modal-body" style="padding:22px 32px;">
      <div class="d-flex flex-wrap gap-2 mb-4">
        <span class="chip"><i class="fas fa-clock"></i>${i.duration || '—'}</span>
        <span class="chip"><i class="fas fa-money-bill-wave"></i>${fmtStipend(i.stipend)}</span>
        <span class="chip"><i class="fas fa-users"></i>${i.openings || '?'} openings</span>
        ${i.min_cgpa ? `<span class="chip"><i class="fas fa-graduation-cap"></i>CGPA ${Number(i.min_cgpa).toFixed(1)}+</span>` : ''}
        <span class="domain-pill">${domainIcon(i.domain)} ${i.domain || 'Other'}</span>
        ${statusBadge(i.status || 'active')}
      </div>
      ${i.description ? `<h6 class="fw-700 mb-2" style="font-size:.88rem;color:var(--text-300);text-transform:uppercase;letter-spacing:.06em;">About the Role</h6><p style="font-size:.9rem;line-height:1.75;margin-bottom:20px;">${i.description}</p>` : ''}
      ${i.requirements ? `<h6 class="fw-700 mb-2" style="font-size:.88rem;color:var(--text-300);text-transform:uppercase;letter-spacing:.06em;">Skills Required</h6><div>${i.requirements.split(',').map(s=>`<span class="skill-chip">${s.trim()}</span>`).join('')}</div>` : ''}
    </div>
    <div class="modal-footer border-0" style="padding:0 32px 28px;gap:10px;">
      <button class="btn btn-outline-glass" data-bs-dismiss="modal">Close</button>
      ${!currentUser
        ? `<button class="btn btn-gradient px-4" onclick="bootstrap.Modal.getInstance(document.getElementById('internshipModal')).hide();navigate('login')">Login to Apply</button>`
        : applied
        ? `<button class="btn btn-outline-glass px-4" disabled style="opacity:.5;cursor:not-allowed;"><i class="fas fa-check me-2"></i>Already Applied</button>`
        : `<button class="btn btn-gradient px-4" onclick="openApplyModal(${i.id},'${i.title.replace(/'/g,"\\'")}','${i.company.replace(/'/g,"\\'")}')">
             <i class="fas fa-paper-plane me-2"></i>Apply Now
           </button>`}
    </div>`;
  new bootstrap.Modal(document.getElementById('internshipModal')).show();
}

// ─── Apply Modal ───────────────────────────────────────────────────────
function openApplyModal(id, title, company) {
  bootstrap.Modal.getInstance(document.getElementById('internshipModal'))?.hide();
  applyingToId = id;
  document.getElementById('applyModalTitle').textContent = title;
  document.getElementById('applyModalCompany').innerHTML = `<i class="fas fa-building"></i>${company}`;
  document.getElementById('coverLetter').value = '';
  new bootstrap.Modal(document.getElementById('applyModal')).show();
}

async function submitApplication() {
  if (!applyingToId) return;
  const cover_letter = document.getElementById('coverLetter').value;
  const res = await api.post('/api/applications/apply', { internship_id: applyingToId, cover_letter });
  if (res.success) {
    appliedIdsCached.add(applyingToId);
    bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide();
    toast('🎉 Application submitted!', 'success');
    if (currentPage === 'internships') loadInternships();
    if (currentPage === 'home') loadHomeInternships();
  } else {
    toast(res.message || 'Could not apply', 'error');
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById('page-login').innerHTML = `
    <div class="auth-page">
      <div class="hero-bg-orbs"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
      <div class="auth-card">
        <div class="text-center">
          <div class="auth-logo-mark"><i class="fas fa-rocket"></i></div>
          <h2 class="auth-title">Welcome back</h2>
          <p class="auth-sub">Sign in to your Campus2Career account</p>
        </div>
        <form onsubmit="doLogin(event)" novalidate>
          <div class="mb-3">
            <label class="form-label">Email Address</label>
            <div class="input-icon-wrap">
              <i class="fas fa-envelope ii-icon"></i>
              <input type="email" id="loginEmail" class="form-control glass-input" placeholder="you@example.com" required autocomplete="email" />
            </div>
          </div>
          <div class="mb-4">
            <label class="form-label">Password</label>
            <div class="input-icon-wrap">
              <i class="fas fa-lock ii-icon"></i>
              <input type="password" id="loginPassword" class="form-control glass-input" placeholder="••••••••" required autocomplete="current-password" />
            </div>
          </div>
          <button type="submit" class="btn btn-gradient w-100 py-3" id="loginBtn">
            <i class="fas fa-sign-in-alt me-2"></i>Sign In
          </button>
        </form>
        <hr class="hr-gradient" style="margin:24px 0;" />
        <div class="text-center" style="font-size:.87rem;color:var(--text-400);">
          Don't have an account?
          <a href="#" onclick="navigate('register')" style="color:var(--accent-light);font-weight:600;margin-left:4px;">Sign Up Free</a>
        </div>
        <div class="demo-creds-box mt-3">
          <div><strong>Admin:</strong> admin@atme.com / admin123</div>
          <div><span class="dc-student"><strong>Student:</strong> vikas@student.com / student123</span></div>
        </div>
      </div>
    </div>`;
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';
  btn.disabled = true;
  const res = await api.post('/api/auth/login', {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value,
  });
  if (res.success) {
    currentUser = res.user; updateNav();
    toast(`👋 Welcome back, ${res.user.name.split(' ')[0]}!`, 'success');
    navigate(res.user.role === 'admin' ? 'admin' : 'dashboard');
  } else {
    toast(res.message || 'Login failed', 'error');
    btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
    btn.disabled = false;
  }
}

// ─── REGISTER ─────────────────────────────────────────────────────────
function renderRegister() {
  document.getElementById('page-register').innerHTML = `
    <div class="auth-page" style="padding-top:80px;align-items:flex-start;">
      <div class="hero-bg-orbs"><div class="orb orb-1"></div><div class="orb orb-2"></div></div>
      <div class="auth-card auth-card-wide" style="margin:auto;">
        <div class="text-center">
          <div class="auth-logo-mark"><i class="fas fa-user-graduate"></i></div>
          <h2 class="auth-title">Create Account</h2>
          <p class="auth-sub">Join 10,000+ students on Campus2Career</p>
        </div>
        <form onsubmit="doRegister(event)" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Full Name *</label>
              <div class="input-icon-wrap"><i class="fas fa-user ii-icon"></i>
                <input type="text" id="regName" class="form-control glass-input" placeholder="Arjun Sharma" required /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Email *</label>
              <div class="input-icon-wrap"><i class="fas fa-envelope ii-icon"></i>
                <input type="email" id="regEmail" class="form-control glass-input" placeholder="you@college.com" required /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Password * <span style="color:var(--text-500);font-size:.78rem;">(min 6 chars)</span></label>
              <div class="input-icon-wrap"><i class="fas fa-lock ii-icon"></i>
                <input type="password" id="regPassword" class="form-control glass-input" placeholder="••••••••" required minlength="6" /></div>
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone</label>
              <div class="input-icon-wrap"><i class="fas fa-phone ii-icon"></i>
                <input type="tel" id="regPhone" class="form-control glass-input" placeholder="10-digit number" /></div>
            </div>
            <div class="col-md-8">
              <label class="form-label">College / University</label>
              <div class="input-icon-wrap"><i class="fas fa-university ii-icon"></i>
                <input type="text" id="regCollege" class="form-control glass-input" placeholder="e.g. RV College of Engineering" /></div>
            </div>
            <div class="col-md-4">
              <label class="form-label">CGPA</label>
              <div class="input-icon-wrap"><i class="fas fa-star ii-icon"></i>
                <input type="number" id="regCgpa" class="form-control glass-input" placeholder="8.5" step="0.1" min="0" max="10" /></div>
            </div>
            <div class="col-12">
              <label class="form-label">Skills <span style="color:var(--text-500);font-size:.78rem;">(comma-separated)</span></label>
              <div class="input-icon-wrap"><i class="fas fa-code ii-icon"></i>
                <input type="text" id="regSkills" class="form-control glass-input" placeholder="React, Node.js, Python, Java…" /></div>
            </div>
            <div class="col-12 mt-1">
              <button type="submit" class="btn btn-gradient w-100 py-3" id="regBtn">
                <i class="fas fa-rocket me-2"></i>Create My Account
              </button>
            </div>
          </div>
        </form>
        <div class="text-center mt-3" style="font-size:.87rem;color:var(--text-400);">
          Already have an account?
          <a href="#" onclick="navigate('login')" style="color:var(--accent-light);font-weight:600;margin-left:4px;">Sign In</a>
        </div>
      </div>
    </div>`;
}

async function doRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('regBtn');
  btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;margin:0 auto;"></div>';
  btn.disabled = true;
  const res = await api.post('/api/auth/register', {
    name: document.getElementById('regName').value,
    email: document.getElementById('regEmail').value,
    password: document.getElementById('regPassword').value,
    phone: document.getElementById('regPhone').value,
    college: document.getElementById('regCollege').value,
    cgpa: document.getElementById('regCgpa').value,
    skills: document.getElementById('regSkills').value,
  });
  if (res.success) {
    currentUser = res.user; updateNav();
    toast('Welcome to Campus2Career!', 'success');
    navigate('dashboard');
  } else {
    toast(res.message || 'Registration failed', 'error');
    btn.innerHTML = '<i class="fas fa-rocket me-2"></i>Create My Account';
    btn.disabled = false;
  }
}

// ─── LOGOUT ────────────────────────────────────────────────────────────
async function logout() {
  await api.post('/api/auth/logout');
  currentUser = null; updateNav();
  toast('Logged out successfully', 'info');
  navigate('home');
}

// ─── STUDENT DASHBOARD ─────────────────────────────────────────────────
async function renderDashboard() {
  document.getElementById('page-dashboard').innerHTML = `
    <div class="page-header" style="padding-bottom:32px;margin-bottom:36px;">
      <div class="container">
        <div class="d-flex align-items-center gap-16 gap-md-4">
          <div class="avatar avatar-lg">${currentUser.name[0].toUpperCase()}</div>
          <div>
            <h1 style="font-size:clamp(1.5rem,3vw,2.2rem);margin-bottom:4px;">Hello, ${currentUser.name.split(' ')[0]}! 👋</h1>
            <p style="margin:0;color:var(--text-400);font-size:.9rem;">${currentUser.email} · ${currentUser.college || 'Student'}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div id="dashStats" class="row g-4 mb-4">
        <div class="col-12"><div class="loader-wrap"><div class="spinner"></div></div></div>
      </div>
      <div class="row g-4">
        <!-- Recent Applications -->
        <div class="col-lg-8">
          <div class="glass-card p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h5 class="fw-700 mb-0">Recent Applications</h5>
              <button class="btn-ghost" onclick="navigate('applications')">View all <i class="fas fa-arrow-right ms-1"></i></button>
            </div>
            <div id="dashApps"><div class="loader-wrap" style="padding:40px;"><div class="spinner"></div></div></div>
          </div>
          <div class="glass-card p-4 mt-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 class="fw-700 mb-1">Recommended Internships</h5>
                <div style="color:var(--text-400);font-size:.84rem;">Matched using your CGPA</div>
              </div>
              <button class="btn-ghost" onclick="navigate('internships')">Browse all <i class="fas fa-arrow-right ms-1"></i></button>
            </div>
            <div id="dashRecommendations"><div class="loader-wrap" style="padding:40px;"><div class="spinner"></div></div></div>
          </div>
        </div>
        <!-- Sidebar -->
        <div class="col-lg-4">
          <div class="glass-card p-4 mb-4 profile-mini-card">
            <h5 class="fw-700 mb-3"><i class="fas fa-user me-2" style="color:var(--accent-light);"></i>My Profile</h5>
            <div class="text-center mb-3">
              <div class="avatar avatar-lg mx-auto mb-3">${currentUser.name[0].toUpperCase()}</div>
              <div class="fw-700">${currentUser.name}</div>
              <div style="color:var(--text-400);font-size:.84rem;">${currentUser.college || '—'}</div>
              ${currentUser.cgpa ? `<div class="mt-2"><span class="domain-pill">⭐ CGPA: ${currentUser.cgpa}</span></div>` : ''}
            </div>
            ${currentUser.skills ? `<div class="mt-2">${currentUser.skills.split(',').slice(0,5).map(s=>`<span class="skill-chip">${s.trim()}</span>`).join('')}</div>` : ''}
            <button class="btn btn-outline-glass w-100 mt-3" onclick="navigate('profile')"><i class="fas fa-edit me-2"></i>Edit Profile</button>
          </div>
          <div class="glass-card p-4">
            <h5 class="fw-700 mb-3"><i class="fas fa-bolt me-2" style="color:var(--warning-light);"></i>Quick Actions</h5>
            <div class="d-flex flex-column gap-2">
              <button class="btn btn-outline-glass" onclick="navigate('internships')"><i class="fas fa-search me-2"></i>Browse Internships</button>
              <button class="btn btn-outline-glass" onclick="navigate('applications')"><i class="fas fa-file-alt me-2"></i>All My Applications</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  loadDashboardData();
}

async function loadDashboardData() {
  const [sRes, aRes, rRes] = await Promise.all([
    api.get('/api/stats/student'),
    api.get('/api/applications/mine'),
    api.get('/api/recommendations')
  ]);
  const s = sRes.stats || {};

  const statItems = [
    ['Total Applications', s.total||0, 'stat-icon-indigo', 'fas fa-file-alt'],
    ['Pending',            s.pending||0,'stat-icon-amber',  'fas fa-hourglass-half'],
    ['Shortlisted',        s.shortlisted||0,'stat-icon-cyan','fas fa-star'],
    ['Selected',           s.selected||0,'stat-icon-green', 'fas fa-trophy'],
  ];
  document.getElementById('dashStats').innerHTML = statItems.map(([label, val, cls, icon]) => `
    <div class="col-6 col-md-3">
      <div class="stat-card">
        <div class="stat-icon-box ${cls}"><i class="${icon}"></i></div>
        <div class="stat-num">${val}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>`).join('');

  const apps = (aRes.applications || []).slice(0, 5);
  document.getElementById('dashApps').innerHTML = apps.length ? `
    <div class="table-wrap">
      <table class="glass-table">
        <thead>
          <tr><th>Internship</th><th>Company</th><th>Status</th><th>Applied</th></tr>
        </thead>
        <tbody>
          ${apps.map(a => `
            <tr>
              <td class="td-primary">${a.title}</td>
              <td>${a.company}</td>
              <td>${statusBadge(a.status)}</td>
              <td>${timeAgo(a.applied_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : `<div class="empty-state" style="padding:40px;">
      <img src="/images/empty-state.png" alt="No applications" style="width:100px;height:100px;" />
      <p>No applications yet.<br><a href="#" onclick="navigate('internships')" style="color:var(--accent-light);">Browse internships</a></p>
    </div>`;

  const recommendations = rRes.internships || [];
  document.getElementById('dashRecommendations').innerHTML = recommendations.length ? `
    <div class="row g-4">
      ${recommendations.slice(0, 3).map(internshipCardHtml).join('')}
    </div>` : `<div class="empty-state" style="padding:40px;">
      <img src="/images/empty-state.png" alt="No recommendations" style="width:100px;height:100px;" />
      <p>No CGPA-matched internships yet.<br><a href="#" onclick="navigate('profile')" style="color:var(--accent-light);">Update your CGPA</a></p>
    </div>`;
}

// ─── MY APPLICATIONS ───────────────────────────────────────────────────
async function renderApplications() {
  document.getElementById('page-applications').innerHTML = `
    <div class="page-header">
      <div class="container">
        <div class="breadcrumb-row"><span class="bc-active">Campus2Career</span><i class="fas fa-chevron-right"></i><span>My Applications</span></div>
        <h1>My Applications</h1>
      </div>
    </div>
    <div class="container">
      <div id="myAppsContent"><div class="loader-wrap"><div class="spinner"></div></div></div>
    </div>`;

  const res = await api.get('/api/applications/mine');
  const apps = res.applications || [];
  const el = document.getElementById('myAppsContent');

  if (!apps.length) {
    el.innerHTML = `<div class="empty-state" style="padding:80px;">
      <img src="/images/empty-state.png" alt="No applications" />
      <p>You haven't applied yet.<br><a href="#" onclick="navigate('internships')" style="color:var(--accent-light);">Browse internships</a></p>
    </div>`; return;
  }

  const grouped = { applied: 0, shortlisted: 0, selected: 0, rejected: 0 };
  apps.forEach(a => { if (grouped[a.status] !== undefined) grouped[a.status]++; else grouped.applied++; });

  el.innerHTML = `
    <div class="row g-3 mb-4">
      ${[['applied','stat-icon-cyan','fas fa-hourglass-half'],['shortlisted','stat-icon-amber','fas fa-star'],
         ['selected','stat-icon-green','fas fa-trophy'],['rejected','stat-icon-red','fas fa-times']].map(([s, cls, icon]) => `
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon-box ${cls}"><i class="${icon}"></i></div>
            <div class="stat-num">${grouped[s]}</div>
            <div class="stat-label" style="text-transform:capitalize;">${s}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="table-wrap">
      <table class="glass-table">
        <thead>
          <tr><th>Internship</th><th>Company</th><th>Location</th><th>Stipend</th><th>Status</th><th>Applied</th></tr>
        </thead>
        <tbody>
          ${apps.map(a => `
            <tr>
              <td class="td-primary">${a.title}</td>
              <td>${a.company}</td>
              <td>${a.location || '—'}</td>
              <td>${fmtStipend(a.stipend)}</td>
              <td>${statusBadge(a.status)}</td>
              <td style="white-space:nowrap;">${timeAgo(a.applied_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── PROFILE ───────────────────────────────────────────────────────────
function renderProfile() {
  document.getElementById('page-profile').innerHTML = `
    <div class="page-header">
      <div class="container">
        <h1>Edit Profile</h1>
        <p style="margin-top:8px;color:var(--text-400);">Update your personal information and skills</p>
      </div>
    </div>
    <div class="container" style="max-width:700px;">
      <div class="glass-card p-5">
        <div class="text-center mb-4">
          <div class="avatar avatar-xl mx-auto mb-3">${currentUser.name[0].toUpperCase()}</div>
          <h4>${currentUser.name}</h4>
          <p style="font-size:.88rem;color:var(--text-400);margin:0;">${currentUser.email}</p>
        </div>
        <form onsubmit="saveProfile(event)" novalidate>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Full Name</label>
              <input type="text" id="profName" class="form-control glass-input" value="${currentUser.name || ''}" required />
            </div>
            <div class="col-md-6">
              <label class="form-label">Phone</label>
              <input type="text" id="profPhone" class="form-control glass-input" value="${currentUser.phone || ''}" />
            </div>
            <div class="col-md-8">
              <label class="form-label">College / University</label>
              <input type="text" id="profCollege" class="form-control glass-input" value="${currentUser.college || ''}" />
            </div>
            <div class="col-md-4">
              <label class="form-label">CGPA</label>
              <input type="number" id="profCgpa" class="form-control glass-input" value="${currentUser.cgpa || ''}" step="0.1" min="0" max="10" />
            </div>
            <div class="col-12">
              <label class="form-label">Skills <span style="color:var(--text-500);font-size:.78rem;">(comma-separated)</span></label>
              <input type="text" id="profSkills" class="form-control glass-input" value="${currentUser.skills || ''}" placeholder="React, Java, Python…" />
            </div>
            <div class="col-12 mt-2">
              <button type="submit" class="btn btn-gradient w-100 py-3"><i class="fas fa-save me-2"></i>Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>`;
}

async function saveProfile(e) {
  e.preventDefault();
  const res = await api.put('/api/profile', {
    name: document.getElementById('profName').value,
    phone: document.getElementById('profPhone').value,
    college: document.getElementById('profCollege').value,
    cgpa: document.getElementById('profCgpa').value,
    skills: document.getElementById('profSkills').value,
  });
  if (res.success) {
    currentUser = res.user; updateNav();
    toast('✅ Profile updated!', 'success');
  } else { toast(res.message || 'Failed', 'error'); }
}

// ─── ADMIN PANEL ───────────────────────────────────────────────────────
let adminTab = 'overview';

async function renderAdmin() {
  document.getElementById('page-admin').innerHTML = `
    <div class="page-header" style="padding-bottom:32px;margin-bottom:32px;">
      <div class="container">
        <div class="breadcrumb-row"><span class="bc-active">Campus2Career</span><i class="fas fa-chevron-right"></i><span>Admin Panel</span></div>
        <div class="d-flex align-items-center gap-3">
          <div style="width:52px;height:52px;background:var(--grad-button);border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(99,102,241,0.4);">
            <i class="fas fa-shield-alt" style="color:white;font-size:1.2rem;"></i>
          </div>
          <div>
            <h1 style="font-size:clamp(1.4rem,3vw,2rem);margin:0;">Admin Panel</h1>
            <p style="color:var(--text-400);margin:0;font-size:.88rem;">Manage your platform</p>
          </div>
        </div>
      </div>
    </div>
    <div class="container">
      <div class="admin-tabs" id="adminTabNav">
        <button class="admin-tab-btn ${adminTab==='overview'?'active':''}" onclick="switchAdminTab('overview')"><i class="fas fa-chart-bar"></i>Overview</button>
        <button class="admin-tab-btn ${adminTab==='internships'?'active':''}" onclick="switchAdminTab('internships')"><i class="fas fa-briefcase"></i>Internships</button>
        <button class="admin-tab-btn ${adminTab==='applications'?'active':''}" onclick="switchAdminTab('applications')"><i class="fas fa-file-alt"></i>Applications</button>
        <button class="admin-tab-btn ${adminTab==='users'?'active':''}" onclick="switchAdminTab('users')"><i class="fas fa-users"></i>Students</button>
      </div>
      <div id="adminContent"><div class="loader-wrap"><div class="spinner"></div></div></div>
    </div>`;
  loadAdminContent(adminTab);
}

function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll('.admin-tab-btn').forEach((b, i) => {
    const tabs = ['overview','internships','applications','users'];
    b.classList.toggle('active', tabs[i] === tab);
  });
  loadAdminContent(tab);
}

async function loadAdminContent(tab) {
  if (tab === 'overview')      await loadAdminOverview();
  if (tab === 'internships')   await loadAdminInternships();
  if (tab === 'applications')  await loadAdminApplications();
  if (tab === 'users')         await loadAdminUsers();
}

// Admin: Overview
async function loadAdminOverview() {
  const el = document.getElementById('adminContent');
  el.innerHTML = `<div class="loader-wrap"><div class="spinner"></div></div>`;
  const res = await api.get('/api/stats');
  const s = res.stats || {};
  el.innerHTML = `
    <div class="row g-4 mb-4">
      ${[
        ['Total Students',    s.totalStudents,       'stat-icon-indigo', 'fas fa-users'],
        ['Active Internships',s.totalInternships,    'stat-icon-violet', 'fas fa-briefcase'],
        ['Total Applications',s.totalApplications,   'stat-icon-cyan',   'fas fa-file-alt'],
        ['Pending Review',    s.pendingApplications, 'stat-icon-amber',  'fas fa-hourglass-half'],
        ['Selected',          s.selectedApplications,'stat-icon-green',  'fas fa-trophy'],
      ].map(([label,val,cls,icon]) => `
        <div class="col-6 col-md-4 col-xl">
          <div class="stat-card">
            <div class="stat-icon-box ${cls}"><i class="${icon}"></i></div>
            <div class="stat-num">${val || 0}</div>
            <div class="stat-label">${label}</div>
          </div>
        </div>`).join('')}
    </div>
    <div class="row g-4">
      <div class="col-lg-7">
        <div class="glass-card p-4">
          <h5 class="fw-700 mb-4">Recent Applications</h5>
          ${(res.recentApps||[]).length ? `
            <div class="table-wrap">
              <table class="glass-table">
                <thead><tr><th>Student</th><th>Internship</th><th>Company</th><th>Status</th></tr></thead>
                <tbody>${(res.recentApps||[]).map(a=>`
                  <tr>
                    <td class="td-primary">${a.student_name}</td>
                    <td>${a.title}</td><td>${a.company}</td>
                    <td>${statusBadge(a.status)}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>` :
            `<div class="empty-state" style="padding:40px;">
              <img src="/images/empty-state.png" alt="No data" style="width:90px;height:90px;" />
              <p>No applications yet</p>
            </div>`}
        </div>
      </div>
      <div class="col-lg-5">
        <div class="glass-card p-4">
          <h5 class="fw-700 mb-4">Internships by Domain</h5>
          ${(res.domainStats||[]).map(d => `
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span style="font-size:.84rem;color:var(--text-300);">${domainIcon(d.domain)} ${d.domain}</span>
                <span style="font-size:.84rem;font-weight:700;">${d.count}</span>
              </div>
              <div class="prog-wrap"><div class="prog-fill" style="width:${Math.min(100,(d.count/8)*100)}%"></div></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// Admin: Internships
let adminInternPage = 1;
async function loadAdminInternships(page = adminInternPage) {
  adminInternPage = page;
  const el = document.getElementById('adminContent');
  el.innerHTML = `<div class="loader-wrap"><div class="spinner"></div></div>`;
  const res = await api.get(`/api/internships?page=${page}&limit=10`);
  el.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="fw-700 mb-0">All Internships <span style="color:var(--text-400);font-weight:400;font-size:.9rem;">(${res.total||0} total)</span></h5>
      <button class="btn btn-gradient" onclick="openAddInternship()"><i class="fas fa-plus me-2"></i>Add Internship</button>
    </div>
    <div class="table-wrap">
      <table class="glass-table">
        <thead>
          <tr><th>Title</th><th>Company</th><th>Location</th><th>Stipend</th><th>Duration</th><th>Openings</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${(res.internships||[]).map(i=>`
            <tr>
              <td class="td-primary">${i.title}</td>
              <td>${i.company}</td>
              <td>${i.location||'—'}</td>
              <td>${fmtStipend(i.stipend)}</td>
              <td>${i.duration||'—'}</td>
              <td>${i.openings||'—'}</td>
              <td>${statusBadge(i.status||'active')}</td>
              <td style="white-space:nowrap;">
                <button class="btn-icon btn-icon-edit me-1" title="Edit" onclick='openEditInternship(${JSON.stringify(i)})'><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-icon-delete" title="Delete" onclick="deleteInternship(${i.id})"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination-wrap mt-3">
      ${Array.from({length:res.totalPages||1},(_,k)=>k+1).map(p=>`<button class="page-btn ${p===page?'active':''}" onclick="loadAdminInternships(${p})">${p}</button>`).join('')}
    </div>`;
}

// Admin: Applications
let adminAppPage = 1;
async function loadAdminApplications(page = adminAppPage) {
  adminAppPage = page;
  const el = document.getElementById('adminContent');
  el.innerHTML = `<div class="loader-wrap"><div class="spinner"></div></div>`;
  const res = await api.get(`/api/applications?page=${page}`);
  el.innerHTML = `
    <div class="mb-4">
      <h5 class="fw-700 mb-0">All Applications <span style="color:var(--text-400);font-weight:400;font-size:.9rem;">(${res.total||0} total)</span></h5>
    </div>
    <div class="table-wrap">
      <table class="glass-table">
        <thead>
          <tr><th>Student</th><th>College</th><th>Internship</th><th>Company</th><th>Applied</th><th>Status</th><th>Update</th></tr>
        </thead>
        <tbody>
          ${(res.applications||[]).map(a=>`
            <tr>
              <td>
                <div class="td-primary">${a.student_name}</div>
                <div style="font-size:.75rem;color:var(--text-500);">${a.student_email}</div>
              </td>
              <td style="font-size:.82rem;">${a.college||'—'}</td>
              <td>${a.internship_title}</td>
              <td>${a.company}</td>
              <td style="white-space:nowrap;font-size:.82rem;">${timeAgo(a.applied_at)}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                <select class="form-control glass-input" style="padding:6px 10px!important;font-size:.78rem!important;border-radius:var(--radius-sm)!important;min-width:130px;"
                  onchange="updateAppStatus(${a.id},this.value)">
                  ${['applied','shortlisted','selected','rejected'].map(s=>`<option value="${s}" ${a.status===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination-wrap mt-3">
      ${Array.from({length:res.totalPages||1},(_,k)=>k+1).map(p=>`<button class="page-btn ${p===page?'active':''}" onclick="loadAdminApplications(${p})">${p}</button>`).join('')}
    </div>`;
}

// Admin: Users
let adminUserPage = 1;
async function loadAdminUsers(page = adminUserPage) {
  adminUserPage = page;
  const el = document.getElementById('adminContent');
  el.innerHTML = `<div class="loader-wrap"><div class="spinner"></div></div>`;
  const res = await api.get(`/api/users?page=${page}`);
  el.innerHTML = `
    <div class="mb-4">
      <h5 class="fw-700 mb-0">Registered Students <span style="color:var(--text-400);font-weight:400;font-size:.9rem;">(${res.total||0} total)</span></h5>
    </div>
    <div class="table-wrap">
      <table class="glass-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>College</th><th>CGPA</th><th>Skills</th><th>Joined</th></tr>
        </thead>
        <tbody>
          ${(res.users||[]).map(u=>`
            <tr>
              <td class="td-primary">${u.name}</td>
              <td style="font-size:.84rem;">${u.email}</td>
              <td style="font-size:.82rem;">${u.college||'—'}</td>
              <td>${u.cgpa||'—'}</td>
              <td>${u.skills ? u.skills.split(',').slice(0,3).map(s=>`<span class="skill-chip">${s.trim()}</span>`).join('') : '—'}</td>
              <td style="white-space:nowrap;font-size:.82rem;">${timeAgo(u.created_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="pagination-wrap mt-3">
      ${Array.from({length:res.totalPages||1},(_,k)=>k+1).map(p=>`<button class="page-btn ${p===page?'active':''}" onclick="loadAdminUsers(${p})">${p}</button>`).join('')}
    </div>`;
}

// Admin: Status update
async function updateAppStatus(id, status) {
  const res = await api.put(`/api/applications/${id}/status`, { status });
  if (res.success) toast(`✅ Marked as ${status}`, 'success');
  else toast('Update failed', 'error');
}

// Admin: Add Internship
function openAddInternship() {
  document.getElementById('adminModalTitle').textContent = 'Add New Internship';
  document.getElementById('adminSaveLabel').textContent = 'Create Internship';
  document.getElementById('editId').value = '';
  ['fTitle','fCompany','fLocation','fDuration','fDescription','fRequirements'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  ['fStipend','fOpenings'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const fd = document.getElementById('fDomain'), fs = document.getElementById('fStatus');
  if(fd) fd.value = ''; if(fs) fs.value = 'active';
  new bootstrap.Modal(document.getElementById('adminInternshipModal')).show();
}

// Admin: Edit Internship
function openEditInternship(i) {
  document.getElementById('adminModalTitle').textContent = 'Edit Internship';
  document.getElementById('adminSaveLabel').textContent = 'Save Changes';
  const fields = { editId: i.id, fTitle: i.title, fCompany: i.company, fLocation: i.location,
    fStipend: i.stipend, fDuration: i.duration, fDomain: i.domain, fOpenings: i.openings,
    fStatus: i.status||'active', fDescription: i.description, fRequirements: i.requirements };
  Object.entries(fields).forEach(([id, val]) => { const el = document.getElementById(id); if(el) el.value = val||''; });
  new bootstrap.Modal(document.getElementById('adminInternshipModal')).show();
}

async function saveInternship() {
  const id = document.getElementById('editId').value;
  const data = {
    title:        document.getElementById('fTitle').value,
    company:      document.getElementById('fCompany').value,
    location:     document.getElementById('fLocation').value,
    stipend:      document.getElementById('fStipend').value,
    duration:     document.getElementById('fDuration').value,
    domain:       document.getElementById('fDomain').value,
    openings:     document.getElementById('fOpenings').value,
    status:       document.getElementById('fStatus').value,
    description:  document.getElementById('fDescription').value,
    requirements: document.getElementById('fRequirements').value,
  };
  const res = id ? await api.put(`/api/internships/${id}`, data) : await api.post('/api/internships', data);
  if (res.success) {
    bootstrap.Modal.getInstance(document.getElementById('adminInternshipModal')).hide();
    toast(res.message || 'Saved!', 'success');
    loadAdminInternships();
  } else { toast(res.message || 'Error saving', 'error'); }
}

async function deleteInternship(id) {
  if (!confirm('Delete this internship? All related applications will be removed.')) return;
  const res = await api.delete(`/api/internships/${id}`);
  if (res.success) { toast('Internship deleted', 'success'); loadAdminInternships(); }
  else toast('Delete failed', 'error');
}

// ─── Helper: Empty State HTML ──────────────────────────────────────────
function emptyState(title, sub = '') {
  return `<div class="col-12"><div class="empty-state">
    <img src="/images/empty-state.png" alt="${title}" />
    <p style="font-weight:600;color:var(--text-200);">${title}</p>
    ${sub ? `<p style="font-size:.85rem;">${sub}</p>` : ''}
  </div></div>`;
}
