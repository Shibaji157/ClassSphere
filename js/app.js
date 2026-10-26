/* ================================================================
   ClassSphere – Core Application Logic
   Author : Shibaji Biswas
   ================================================================ */

/* ─── STATE ─── */
const AppState = {
  currentUser: null,
  currentView: 'dashboard',
  sidebarCollapsed: false,
  notifOpen: false,
};

/* ─── INIT ─── */
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('cs_user');
  if (saved) {
    const savedUser = JSON.parse(saved);
    AppState.currentUser = DB.getUserById(savedUser.id) || savedUser;
    bootApp();
  }
});

/* ═════════════════════════════════════════════════════════════════
   AUTH
   ═════════════════════════════════════════════════════════════════ */
let selectedRole = 'teacher';

function switchRole(role) {
  selectedRole = role;
  document.getElementById('tab-teacher').classList.toggle('active', role === 'teacher');
  document.getElementById('tab-student').classList.toggle('active', role === 'student');
}

let registrationRole = 'teacher';

function switchRegRole(role) {
  registrationRole = role;
  selectedRole = role;
  document.getElementById('tab-teacher').classList.toggle('active', role === 'teacher');
  document.getElementById('tab-student').classList.toggle('active', role === 'student');
  document.getElementById('reg-tab-teacher').classList.toggle('active', role === 'teacher');
  document.getElementById('reg-tab-student').classList.toggle('active', role === 'student');
  document.getElementById('reg-uid-group').style.display = role === 'student' ? '' : 'none';
}

function showRegister(e) {
  e.preventDefault();
  document.getElementById('login-card').style.display = 'none';
  document.getElementById('register-card').style.display = '';
  switchRegRole(selectedRole);
  document.getElementById('register-form').reset();
}

function showLogin(e) {
  if (e) e.preventDefault();
  document.getElementById('login-card').style.display = '';
  document.getElementById('register-card').style.display = 'none';
}

function fillDemo(role) {
  switchRole(role);
  document.getElementById('login-email').value    = role === 'teacher' ? 'teacher@classsphere.edu' : 'student@classsphere.edu';
  document.getElementById('login-password').value = role === 'teacher' ? 'teacher123' : 'student123';
}

function togglePassword() {
  const inp = document.getElementById('login-password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');

  btn.classList.add('loading');
  btn.innerHTML = '<div class="spinner"></div><span>Signing in…</span>';

  setTimeout(() => {
    const user = DB.users.find(u => u.email.toLowerCase() === email && u.password === password && u.role === selectedRole);
    if (user) {
      AppState.currentUser = user;
      sessionStorage.setItem('cs_user', JSON.stringify(user));
      showToast('Welcome back, ' + user.name.split(' ')[0] + '! 👋', 'success');
      bootApp();
    } else {
      btn.classList.remove('loading');
      btn.innerHTML = '<span>Sign In</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      showToast('Invalid email, password, or account type. Create an account or check the selected role.', 'error');
    }
  }, 900);
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const department = document.getElementById('reg-dept').value.trim();
  const uid = document.getElementById('reg-uid').value.trim();
  const btn = document.getElementById('register-btn');

  if (DB.users.some(user => user.email.toLowerCase() === email)) {
    showToast('An account with this email already exists. Please sign in.', 'error');
    return;
  }

  const user = {
    id: 'u' + Date.now(),
    role: registrationRole,
    name,
    email,
    password,
    department,
    phone: '',
    bio: '',
    joinDate: new Date().toISOString().split('T')[0],
    avatar: name.split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join(''),
    ...(registrationRole === 'student' ? { uid, semester: '1st' } : {})
  };

  btn.classList.add('loading');
  btn.innerHTML = '<div class="spinner"></div><span>Creating account…</span>';

  try {
    DB.addUser(user);
  } catch (error) {
    console.error('Unable to save the new account.', error);
    btn.classList.remove('loading');
    btn.innerHTML = '<span>Create Account</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    showToast('Unable to save your account in this browser. Please try again.', 'error');
    return;
  }

  AppState.currentUser = user;
  sessionStorage.setItem('cs_user', JSON.stringify(user));
  showToast('Account created successfully. Welcome, ' + name.split(' ')[0] + '!', 'success');
  bootApp();
}

function logout() {
  sessionStorage.removeItem('cs_user');
  AppState.currentUser = null;
  AppState.currentView = 'dashboard';
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('login-page').classList.add('active');
  document.getElementById('login-page').style.display = 'flex';
  showLogin();
  document.getElementById('login-form').reset();
  const btn = document.getElementById('login-btn');
  btn.classList.remove('loading');
  btn.innerHTML = '<span>Sign In</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
  showToast('Signed out successfully. See you soon!', 'info');
}

/* ═════════════════════════════════════════════════════════════════
   APP BOOT
   ═════════════════════════════════════════════════════════════════ */
function bootApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-shell').style.display = 'flex';

  const u = AppState.currentUser;
  // Topbar
  applyAvatar(document.getElementById('topbar-avatar'), u);
  document.getElementById('topbar-name').textContent   = u.name.split(' ')[0];
  // Sidebar footer
  applyAvatar(document.getElementById('user-avatar-sm'), u);
  document.getElementById('user-name-sm').textContent   = u.name;
  document.getElementById('user-role-sm').textContent   = u.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student';

  buildSidebarNav();
  renderNotifications();
  navigateTo('dashboard');
}

function applyAvatar(element, user) {
  element.textContent = user.avatar || user.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  element.style.backgroundImage = '';
  if (user.profileImage && /^data:image\/(jpeg|png|webp);base64,/.test(user.profileImage)) {
    element.textContent = '';
    element.style.backgroundImage = `url("${user.profileImage}")`;
  }
}

function applyProfileBackground(element, user) {
  if (!element) return;
  element.style.backgroundImage = '';
  if (user.profileBackground && /^data:image\/(jpeg|png|webp);base64,/.test(user.profileBackground)) {
    element.style.backgroundImage = `linear-gradient(rgba(10,15,30,0.15), rgba(10,15,30,0.15)), url("${user.profileBackground}")`;
  }
}

/* ═════════════════════════════════════════════════════════════════
   SIDEBAR
   ═════════════════════════════════════════════════════════════════ */
const NAV_TEACHER = [
  { section: 'Overview' },
  { id:'dashboard',    label:'Dashboard',       icon:'grid', badge:null },
  { id:'courses',      label:'My Courses',      icon:'book', badge:null },
  { section:'Teaching' },
  { id:'assignments',  label:'Assignments',     icon:'clipboard', badge:null },
  { id:'submissions',  label:'Submissions',     icon:'inbox', badge:null },
  { id:'announcements',label:'Announcements',   icon:'bell', badge:null },
  { section:'Management' },
  { id:'students',     label:'Students',        icon:'users', badge:null },
  { id:'attendance',   label:'Attendance',      icon:'calendar', badge:null },
  { id:'analytics',   label:'Analytics',       icon:'bar-chart', badge:null },
  { section:'Account' },
  { id:'profile',      label:'Profile',         icon:'user', badge:null },
];
const NAV_STUDENT = [
  { section:'Overview' },
  { id:'dashboard',    label:'Dashboard',       icon:'grid', badge:null },
  { id:'courses',      label:'My Courses',      icon:'book', badge:null },
  { section:'Academic' },
  { id:'assignments',  label:'Assignments',     icon:'clipboard', badge:null },
  { id:'submissions',  label:'My Submissions',  icon:'upload', badge:null },
  { id:'grades',       label:'Grades',          icon:'award', badge:null },
  { section:'Campus' },
  { id:'announcements',label:'Announcements',   icon:'bell', badge:null },
  { id:'attendance',   label:'Attendance',      icon:'calendar', badge:null },
  { id:'enroll',       label:'Enroll in Course',icon:'plus-circle', badge:null },
  { section:'Account' },
  { id:'profile',      label:'Profile',         icon:'user', badge:null },
];

const ICONS = {
  'grid'       : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  'book'       : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  'clipboard'  : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
  'inbox'      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
  'bell'       : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  'users'      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  'calendar'   : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  'bar-chart'  : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
  'user'       : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  'upload'     : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>',
  'award'      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
  'plus-circle': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
};

function buildSidebarNav() {
  const nav   = document.getElementById('sidebar-nav');
  const items = AppState.currentUser.role === 'teacher' ? NAV_TEACHER : NAV_STUDENT;
  nav.innerHTML = items.map(item => {
    if (item.section) return `<div class="nav-section-label">${item.section}</div>`;
    const badgeCount = getNavBadgeCount(item.id);
    const badge = badgeCount ? `<span class="nav-badge">${badgeCount}</span>` : '';
    return `<div class="nav-item" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
      ${ICONS[item.icon] || ''}
      <span class="nav-label">${item.label}</span>
      ${badge}
    </div>`;
  }).join('');
}

function getNavBadgeCount(view) {
  const user = AppState.currentUser;
  if (view === 'announcements') {
    return DB.getUnreadAnnouncementsForUser(user.id).length;
  }

  if (view === 'assignments' && user.role === 'student') {
    const assignments = DB.getCoursesForStudent(user.id)
      .flatMap(course => DB.getAssignmentsForCourse(course.id))
      .filter(assignment => assignment.status === 'active');
    return assignments.filter(assignment =>
      !DB.submissions.some(submission =>
        submission.assignmentId === assignment.id && submission.studentId === user.id
      )
    ).length;
  }

  if (view === 'submissions' && user.role === 'teacher') {
    const assignmentIds = new Set(
      DB.getCoursesForTeacher(user.id).flatMap(course =>
        DB.getAssignmentsForCourse(course.id).map(assignment => assignment.id)
      )
    );
    return DB.submissions.filter(submission =>
      assignmentIds.has(submission.assignmentId) && submission.status === 'submitted'
    ).length;
  }

  return 0;
}

function refreshNavBadges() {
  document.querySelectorAll('.nav-item').forEach(navItem => {
    const count = getNavBadgeCount(navItem.id.replace('nav-', ''));
    let badge = navItem.querySelector('.nav-badge');
    if (!count) {
      badge?.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-badge';
      navItem.appendChild(badge);
    }
    badge.textContent = count;
  });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    AppState.sidebarCollapsed = !AppState.sidebarCollapsed;
    sidebar.classList.toggle('collapsed', AppState.sidebarCollapsed);
  }
}

/* ═════════════════════════════════════════════════════════════════
   NAVIGATION
   ═════════════════════════════════════════════════════════════════ */
function navigateTo(view) {
  AppState.currentView = view;
  if (view === 'announcements') {
    DB.markAnnouncementsReadForUser(AppState.currentUser.id);
  }
  refreshNavBadges();
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + view);
  if (navEl) navEl.classList.add('active');
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
  // Close notification panel
  closeNotifications();

  const area = document.getElementById('content-area');
  area.innerHTML = '<div class="empty-state"><div class="spinner" style="width:40px;height:40px;border-width:3px"></div></div>';
  setTimeout(() => {
    const renderer = VIEWS[view];
    if (renderer) {
      area.innerHTML = renderer(AppState.currentUser);
      if (view === 'profile') {
        applyAvatar(area.querySelector('.profile-avatar'), AppState.currentUser);
        applyProfileBackground(area.querySelector('.profile-banner'), AppState.currentUser);
      }
    }
    else { area.innerHTML = renderNotFound(); }
  }, 200);
}

/* ═════════════════════════════════════════════════════════════════
   NOTIFICATIONS
   ═════════════════════════════════════════════════════════════════ */
function renderNotifications() {
  const unread = DB.notifications.filter(n => !n.read);
  const badge  = document.getElementById('notif-badge');
  badge.textContent = unread.length;
  badge.style.display = unread.length ? 'flex' : 'none';

  const list = document.getElementById('notif-list');
  if (!DB.notifications.length) {
    list.innerHTML = '<div class="empty-state" style="padding:32px"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
    return;
  }
  const icons = { assignment:'📋', grade:'🏆', announcement:'📢', event:'🎓', info:'ℹ️' };
  list.innerHTML = DB.notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
      <div class="notif-dot" style="${n.read ? 'opacity:0' : ''}"></div>
      <div class="notif-content">
        <div class="notif-text">${icons[n.type]||'🔔'} ${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>`).join('');
}

function toggleNotifications() {
  const panel = document.getElementById('notif-panel');
  AppState.notifOpen = !AppState.notifOpen;
  panel.style.display = AppState.notifOpen ? 'block' : 'none';
}
function closeNotifications() {
  AppState.notifOpen = false;
  document.getElementById('notif-panel').style.display = 'none';
}
function markNotifRead(id) {
  const n = DB.notifications.find(x => x.id === id);
  if (n) {
    n.read = true;
    DB.save();
  }
  renderNotifications();
}
function clearNotifications() {
  DB.notifications.forEach(n => n.read = true);
  DB.save();
  renderNotifications();
  showToast('All notifications marked as read', 'success');
}

// Close notifications on outside click
document.addEventListener('click', e => {
  if (AppState.notifOpen && !e.target.closest('#notif-panel') && !e.target.closest('#notif-btn')) {
    closeNotifications();
  }
});

/* ═════════════════════════════════════════════════════════════════
   GLOBAL SEARCH
   ═════════════════════════════════════════════════════════════════ */
function globalSearch(query) {
  if (!query.trim()) return;
  const q   = query.toLowerCase();
  const u   = AppState.currentUser;
  const courses = (u.role==='teacher' ? DB.getCoursesForTeacher(u.id) : DB.getCoursesForStudent(u.id))
                  .filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  const assigns = DB.assignments.filter(a => a.title.toLowerCase().includes(q));

  if (courses.length === 1 && !assigns.length) navigateTo('courses');
  else if (assigns.length === 1 && !courses.length) navigateTo('assignments');
}

/* ═════════════════════════════════════════════════════════════════
   MODALS
   ═════════════════════════════════════════════════════════════════ */
function openModal(title, bodyHTML) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML     = bodyHTML;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay') && e !== undefined && e.currentTarget) {
    if (!e.target.classList.contains('modal-overlay') && e.target.id !== 'modal-overlay') return;
  }
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ═════════════════════════════════════════════════════════════════
   TOASTS
   ═════════════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  const tc  = document.getElementById('toast-container');
  const div = document.createElement('div');
  div.className = `toast toast-${type}`;
  div.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-text">${message}</span>`;
  tc.appendChild(div);
  setTimeout(() => {
    div.classList.add('removing');
    setTimeout(() => div.remove(), 250);
  }, 3500);
}

/* ═════════════════════════════════════════════════════════════════
   TEACHER ACTIONS
   ═════════════════════════════════════════════════════════════════ */
function openAddCourseModal() {
  openModal('Create New Course', `
    <form class="modal-form" onsubmit="submitAddCourse(event)">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Course Code</label>
          <div class="input-wrapper"><input id="nc-code" type="text" class="form-input" placeholder="e.g. CS501" required/></div>
        </div>
        <div class="form-group">
          <label class="form-label">Credits</label>
          <div class="input-wrapper"><input id="nc-credits" type="number" class="form-input" placeholder="4" min="1" max="6" required/></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Course Name</label>
        <div class="input-wrapper"><input id="nc-name" type="text" class="form-input" placeholder="e.g. Operating Systems" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <div class="input-wrapper"><textarea id="nc-desc" class="form-input" rows="3" placeholder="Brief course description…"></textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Schedule</label>
          <div class="input-wrapper"><input id="nc-sched" type="text" class="form-input" placeholder="Mon/Wed/Fri 10:00–11:00 AM"/></div>
        </div>
        <div class="form-group">
          <label class="form-label">Room</label>
          <div class="input-wrapper"><input id="nc-room" type="text" class="form-input" placeholder="LH-201"/></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Max Students</label>
        <div class="input-wrapper"><input id="nc-max" type="number" class="form-input" placeholder="60" min="1" value="60"/></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Course</button>
      </div>
    </form>`);
}

function submitAddCourse(e) {
  e.preventDefault();
  const colors = [
    'linear-gradient(135deg,#3b82f6,#8b5cf6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
  ];
  const course = DB.addCourse({
    code: document.getElementById('nc-code').value,
    name: document.getElementById('nc-name').value,
    description: document.getElementById('nc-desc').value,
    schedule: document.getElementById('nc-sched').value,
    room: document.getElementById('nc-room').value,
    credits: parseInt(document.getElementById('nc-credits').value)||3,
    maxStudents: parseInt(document.getElementById('nc-max').value)||60,
    teacherId: AppState.currentUser.id,
    color: colors[Math.floor(Math.random()*colors.length)],
    totalClasses: 0, completedClasses: 0,
    enrolledStudents: [], tags: []
  });
  closeModal();
  showToast(`Course "${course.name}" created successfully!`, 'success');
  navigateTo('courses');
}

function openAddAssignmentModal(preselectedCourseId = '') {
  const teacherCourses = DB.getCoursesForTeacher(AppState.currentUser.id);
  const courseOptions  = teacherCourses.map(c => `<option value="${c.id}" ${c.id===preselectedCourseId?'selected':''}>${c.code} – ${c.name}</option>`).join('');
  openModal('Post New Assignment', `
    <form class="modal-form" onsubmit="submitAddAssignment(event)">
      <div class="form-group">
        <label class="form-label">Course</label>
        <div class="input-wrapper"><select id="na-course" class="form-input">${courseOptions}</select></div>
      </div>
      <div class="form-group">
        <label class="form-label">Title</label>
        <div class="input-wrapper"><input id="na-title" type="text" class="form-input" placeholder="Assignment title" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <div class="input-wrapper"><textarea id="na-desc" class="form-input" rows="4" placeholder="Detailed description…"></textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Type</label>
          <div class="input-wrapper">
            <select id="na-type" class="form-input">
              <option>Coding</option><option>Project</option><option>Report</option><option>Practical</option><option>Quiz</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Total Marks</label>
          <div class="input-wrapper"><input id="na-marks" type="number" class="form-input" placeholder="100" min="1" required/></div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Due Date</label>
        <div class="input-wrapper"><input id="na-due" type="date" class="form-input" required/></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Post Assignment</button>
      </div>
    </form>`);
}

function submitAddAssignment(e) {
  e.preventDefault();
  const assignment = DB.addAssignment({
    courseId: document.getElementById('na-course').value,
    title: document.getElementById('na-title').value,
    description: document.getElementById('na-desc').value,
    type: document.getElementById('na-type').value,
    totalMarks: parseInt(document.getElementById('na-marks').value),
    dueDate: document.getElementById('na-due').value,
    status: 'active', publishedDate: new Date().toISOString().split('T')[0], attachments: []
  });
  closeModal();
  showToast(`Assignment "${assignment.title}" posted!`, 'success');
  navigateTo('assignments');
}

function openAddAnnouncementModal(preselectedCourseId = '') {
  const teacherCourses = DB.getCoursesForTeacher(AppState.currentUser.id);
  const courseOptions  = teacherCourses.map(c => `<option value="${c.id}" ${c.id===preselectedCourseId?'selected':''}>${c.code} – ${c.name}</option>`).join('');
  openModal('Post Announcement', `
    <form class="modal-form" onsubmit="submitAddAnnouncement(event)">
      <div class="form-group">
        <label class="form-label">Course</label>
        <div class="input-wrapper"><select id="ann-course" class="form-input">${courseOptions}</select></div>
      </div>
      <div class="form-group">
        <label class="form-label">Title</label>
        <div class="input-wrapper"><input id="ann-title" type="text" class="form-input" placeholder="Announcement title" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Message</label>
        <div class="input-wrapper"><textarea id="ann-body" class="form-input" rows="5" placeholder="Write your announcement here…" required></textarea></div>
      </div>
      <div class="form-group">
        <label class="form-label">Priority</label>
        <div class="input-wrapper">
          <select id="ann-priority" class="form-input">
            <option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Post Announcement</button>
      </div>
    </form>`);
}

function submitAddAnnouncement(e) {
  e.preventDefault();
  const cid    = document.getElementById('ann-course').value;
  const course = DB.getCourseById(cid);
  const ann    = DB.addAnnouncement({
    courseId: cid, courseCode: course?.code || '',
    teacherId: AppState.currentUser.id,
    title: document.getElementById('ann-title').value,
    body: document.getElementById('ann-body').value,
    priority: document.getElementById('ann-priority').value,
    createdAt: new Date().toISOString(), pinned: false
  });
  closeModal();
  showToast('Announcement posted!', 'success');
  navigateTo('announcements');
}

function openGradeModal(submissionId) {
  const sub   = DB.submissions.find(s => s.id === submissionId);
  const asgn  = DB.getAssignmentById(sub.assignmentId);
  const stud  = DB.getUserById(sub.studentId);
  openModal(`Grade Submission – ${stud?.name}`, `
    <div style="margin-bottom:16px;padding:14px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
      <div style="font-weight:600;margin-bottom:4px">${asgn?.title}</div>
      <div style="font-size:0.82rem;color:var(--text-secondary)">Submitted: ${formatDate(sub.submittedAt)} &nbsp;|&nbsp; File: ${sub.fileName||'No file'}</div>
      ${sub.content ? `<div style="font-size:0.82rem;color:var(--text-secondary);margin-top:6px">${sub.content}</div>`:''}
    </div>
    <form class="modal-form" onsubmit="submitGrade(event,'${submissionId}')">
      <div class="form-group">
        <label class="form-label">Marks (out of ${asgn?.totalMarks})</label>
        <div class="input-wrapper"><input id="grade-marks" type="number" class="form-input" min="0" max="${asgn?.totalMarks}" value="${sub.marks||''}" placeholder="0" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Feedback</label>
        <div class="input-wrapper"><textarea id="grade-feedback" class="form-input" rows="4" placeholder="Write detailed feedback…">${sub.feedback||''}</textarea></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Grade</button>
      </div>
    </form>`);
}

function submitGrade(e, submissionId) {
  e.preventDefault();
  const marks    = parseInt(document.getElementById('grade-marks').value);
  const feedback = document.getElementById('grade-feedback').value;
  DB.gradeSubmission(submissionId, marks, feedback);
  closeModal();
  showToast('Submission graded successfully!', 'success');
  navigateTo('submissions');
}

function openAttendanceModal(courseId) {
  const course  = DB.getCourseById(courseId);
  const students = course.enrolledStudents.map(sid => DB.getUserById(sid)).filter(Boolean);
  const today   = new Date().toISOString().split('T')[0];
  openModal(`Mark Attendance – ${course.code}`, `
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">
      Date: <strong style="color:var(--text-primary)">${today}</strong>
    </p>
    <form class="modal-form" onsubmit="submitAttendance(event,'${courseId}','${today}')">
      <div style="display:flex;flex-direction:column;gap:8px;max-height:340px;overflow-y:auto">
        ${students.map(s => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="user-avatar-sm" style="background:linear-gradient(135deg,var(--accent-blue),var(--accent-purple))">${s.avatar}</div>
              <div>
                <div style="font-size:0.875rem;font-weight:600">${s.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${s.uid||''}</div>
              </div>
            </div>
            <select class="filter-select" name="att_${s.id}" style="padding:5px 10px;font-size:0.8rem">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>`).join('')}
      </div>
      <div class="form-actions" style="margin-top:20px">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Attendance</button>
      </div>
    </form>`);
}

function submitAttendance(e, courseId, date) {
  e.preventDefault();
  const form    = e.target;
  const course  = DB.getCourseById(courseId);
  course.enrolledStudents.forEach(sid => {
    const sel = form.querySelector(`[name="att_${sid}"]`);
    if (sel) DB.markAttendance(courseId, sid, date, sel.value);
  });
  closeModal();
  showToast('Attendance saved successfully!', 'success');
  navigateTo('attendance');
}

/* ═════════════════════════════════════════════════════════════════
   STUDENT ACTIONS
   ═════════════════════════════════════════════════════════════════ */
function openSubmitModal(assignmentId) {
  const asgn = DB.getAssignmentById(assignmentId);
  const existing = DB.submissions.find(s => s.assignmentId === assignmentId && s.studentId === AppState.currentUser.id);
  openModal(`Submit Assignment`, `
    <div style="margin-bottom:16px;padding:12px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
      <div style="font-weight:600">${asgn?.title}</div>
      <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px">Due: ${formatDate(asgn?.dueDate)} &nbsp;|&nbsp; ${asgn?.totalMarks} marks</div>
    </div>
    ${existing ? `<div class="badge badge-amber" style="margin-bottom:12px">⚠️ You have already submitted. Re-submitting will replace your previous submission.</div>` : ''}
    <form class="modal-form" onsubmit="submitStudentAssignment(event,'${assignmentId}')">
      <div class="form-group">
        <label class="form-label">File Name / Link</label>
        <div class="input-wrapper"><input id="sub-file" type="text" class="form-input" placeholder="e.g. my_solution.zip or GitHub link" value="${existing?.fileName||''}" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Notes / Description</label>
        <div class="input-wrapper"><textarea id="sub-content" class="form-input" rows="4" placeholder="Add any notes for your teacher…">${existing?.content||''}</textarea></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Assignment</button>
      </div>
    </form>`);
}

function submitStudentAssignment(e, assignmentId) {
  e.preventDefault();
  const fileName = document.getElementById('sub-file').value;
  const content  = document.getElementById('sub-content').value;
  DB.submitAssignment(assignmentId, AppState.currentUser.id, content, fileName);
  closeModal();
  showToast('Assignment submitted successfully! 🎉', 'success');
  navigateTo('assignments');
}

function openEnrollModal() {
  const uid      = AppState.currentUser.id;
  const enrolled = DB.getCoursesForStudent(uid).map(c => c.id);
  const available = DB.courses.filter(c => !enrolled.includes(c.id));
  if (!available.length) {
    openModal('Enroll in Course', `<div class="empty-state"><div class="empty-icon">🎓</div><h3>All courses enrolled!</h3><p>You are already enrolled in all available courses.</p></div>`);
    return;
  }
  openModal('Enroll in Course', `
    <p style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:16px">Select a course to enroll in:</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      ${available.map(c => `
        <div style="padding:14px;background:var(--bg-glass);border:1px solid var(--border-subtle);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:space-between;gap:12px">
          <div>
            <div style="font-weight:600">${c.name}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px">${c.code} &nbsp;|&nbsp; ${c.credits} credits &nbsp;|&nbsp; ${c.schedule||'TBA'}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="doEnroll('${c.id}')">Enroll</button>
        </div>`).join('')}
    </div>`);
}

function doEnroll(courseId) {
  DB.enrollStudent(courseId, AppState.currentUser.id);
  const course = DB.getCourseById(courseId);
  closeModal();
  showToast(`Enrolled in "${course.name}" successfully! 🎓`, 'success');
  navigateTo('courses');
}

function viewCourseDetail(courseId) {
  const course = DB.getCourseById(courseId);
  const teacher= DB.getUserById(course.teacherId);
  const assigns= DB.getAssignmentsForCourse(courseId);
  const anns   = DB.getAnnouncementsForCourse(courseId);
  const completed = assigns.filter(a => a.status === 'past').length;
  openModal(course.name, `
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge badge-blue">${course.code}</span>
        <span class="badge badge-purple">${course.credits} Credits</span>
        ${(course.tags||[]).map(t=>`<span class="badge badge-cyan">${t}</span>`).join('')}
      </div>
      <p style="font-size:0.875rem;color:var(--text-secondary);line-height:1.6">${course.description}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">INSTRUCTOR</div>
          <div style="font-weight:600;font-size:0.9rem">${teacher?.name||'—'}</div>
        </div>
        <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">SCHEDULE</div>
          <div style="font-weight:600;font-size:0.875rem">${course.schedule||'TBA'}</div>
        </div>
        <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">ROOM</div>
          <div style="font-weight:600;font-size:0.9rem">${course.room||'TBA'}</div>
        </div>
        <div style="padding:12px;background:var(--bg-glass);border-radius:var(--radius-md)">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">STUDENTS</div>
          <div style="font-weight:600;font-size:0.9rem">${course.enrolledStudents.length} / ${course.maxStudents}</div>
        </div>
      </div>
      <div>
        <div style="font-weight:600;margin-bottom:10px">Progress</div>
        <div class="progress-label"><span>${course.completedClasses} of ${course.totalClasses} classes</span><span>${Math.round((course.completedClasses/Math.max(course.totalClasses,1))*100)}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((course.completedClasses/Math.max(course.totalClasses,1))*100)}%"></div></div>
      </div>
      <div style="display:flex;gap:20px;font-size:0.85rem">
        <span>📋 ${assigns.length} Assignments (${completed} past)</span>
        <span>📢 ${anns.length} Announcements</span>
      </div>
    </div>`);
}

/* ─── HELPER DATE FORMATTER ─── */
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function timeAgo(str) {
  const d = new Date(str);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  return Math.floor(diff/86400) + 'd ago';
}

function renderNotFound() {
  return `<div class="empty-state" style="min-height:60vh">
    <div class="empty-icon">🔍</div>
    <h3>Page not found</h3>
    <p>This section doesn't exist yet.</p>
    <button class="btn btn-primary" style="margin-top:16px" onclick="navigateTo('dashboard')">Go to Dashboard</button>
  </div>`;
}
