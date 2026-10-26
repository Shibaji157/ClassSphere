/* ================================================================
   ClassSphere – View Renderers
   Author : Shibaji Biswas
   ================================================================ */

const VIEWS = {};
let pendingProfileImage = null;
let removeProfileImage = false;
let pendingProfileBackground = null;
let removeProfileBackground = false;

/* ════════════════════════════════════════════════════════
   1. DASHBOARD
   ════════════════════════════════════════════════════════ */
VIEWS.dashboard = (user) => {
  if (user.role === 'teacher') return renderTeacherDashboard(user);
  return renderStudentDashboard(user);
};

function renderTeacherDashboard(user) {
  const courses    = DB.getCoursesForTeacher(user.id);
  const totalStuds = [...new Set(courses.flatMap(c => c.enrolledStudents))].length;
  const allAssigns = courses.flatMap(c => DB.getAssignmentsForCourse(c.id));
  const totalSubs  = DB.submissions.length;
  const pending    = DB.submissions.filter(s => s.status === 'submitted').length;
  const recent     = DB.announcements.filter(a => a.teacherId === user.id).slice(0,3);

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Welcome back, ${user.name}! 👋</h1>
      <p class="page-subtitle">Here's what's happening in your classroom today.</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="openAddAnnouncementModal()">📢 Announce</button>
      <button class="btn btn-primary btn-sm" onclick="openAddCourseModal()">+ New Course</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-grid">
    ${statCard('📚', courses.length, 'Active Courses', 'up', '+1 this semester', 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))')}
    ${statCard('🎓', totalStuds, 'Total Students', 'up', '+4 this week', 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))')}
    ${statCard('📋', allAssigns.length, 'Assignments Posted', null, null, 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.08))')}
    ${statCard('⏳', pending, 'Pending Grading', pending>0?'down':'up', pending>0?'Need attention':'All graded!', 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(139,92,246,0.08))')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <!-- Course Overview -->
    <div class="card">
      <div class="card-body">
        <div class="section-header" style="margin-bottom:16px">
          <h2 class="section-title">Course Overview</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('courses')">View All</button>
        </div>
        ${courses.map(c => `
          <div style="margin-bottom:14px;cursor:pointer" onclick="viewCourseDetail('${c.id}')">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <div style="font-weight:600;font-size:0.875rem">${c.name}</div>
              <span class="badge badge-blue">${c.code}</span>
            </div>
            <div class="progress-label"><span>${c.enrolledStudents.length} students</span><span>${Math.round((c.completedClasses/Math.max(c.totalClasses,1))*100)}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((c.completedClasses/Math.max(c.totalClasses,1))*100)}%"></div></div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Pending Submissions -->
    <div class="card">
      <div class="card-body">
        <div class="section-header" style="margin-bottom:16px">
          <h2 class="section-title">Pending Grading</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('submissions')">View All</button>
        </div>
        ${DB.submissions.filter(s=>s.status==='submitted').slice(0,5).map(s => {
          const asgn = DB.getAssignmentById(s.assignmentId);
          const stud = DB.getUserById(s.studentId);
          return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border-subtle)">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="user-avatar-sm">${stud?.avatar||'?'}</div>
              <div>
                <div style="font-size:0.84rem;font-weight:600">${stud?.name}</div>
                <div style="font-size:11px;color:var(--text-muted)">${asgn?.title}</div>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openGradeModal('${s.id}')">Grade</button>
          </div>`;
        }).join('') || '<div class="empty-state" style="padding:24px"><div class="empty-icon">✅</div><p>All submissions graded!</p></div>'}
      </div>
    </div>
  </div>

  <!-- Attendance Summary Chart -->
  <div class="card" style="margin-bottom:24px">
    <div class="card-body">
      <div class="section-header" style="margin-bottom:20px">
        <h2 class="section-title">Attendance Overview (This Month)</h2>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('attendance')">Full Report</button>
      </div>
      ${renderBarChart(courses)}
    </div>
  </div>

  <!-- Recent Announcements -->
  <div>
    <div class="section-header">
      <h2 class="section-title">Recent Announcements</h2>
      <button class="btn btn-secondary btn-sm" onclick="navigateTo('announcements')">View All</button>
    </div>
    ${recent.length ? recent.map(a => announcementCard(a)).join('') : '<div class="empty-state"><div class="empty-icon">📢</div><p>No announcements yet.</p></div>'}
  </div>`;
}

function renderStudentDashboard(user) {
  const courses   = DB.getCoursesForStudent(user.id);
  const allAssigns= courses.flatMap(c => DB.getAssignmentsForCourse(c.id));
  const pending   = allAssigns.filter(a => {
    const sub = DB.submissions.find(s => s.assignmentId === a.id && s.studentId === user.id);
    return a.status === 'active' && !sub;
  });
  const graded = DB.getSubmissionsForStudent(user.id).filter(s => s.status === 'graded');
  const totalPct  = courses.reduce((acc, c) => {
    const recs = DB.getAttendanceForStudent(c.id, user.id);
    return acc + DB.calcAttendancePct(recs);
  }, 0);
  const avgAtt = courses.length ? Math.round(totalPct / courses.length) : 0;

  let totalEarned = 0, totalPossible = 0;
  graded.forEach(s => {
    const asgn = DB.getAssignmentById(s.assignmentId);
    totalEarned += s.marks||0;
    totalPossible += asgn?.totalMarks||0;
  });
  const gpa = totalPossible ? Math.round((totalEarned/totalPossible)*100) : 0;

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Hello, ${user.name.split(' ')[0]}! 👋</h1>
      <p class="page-subtitle">Here's your academic overview for today.</p>
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-primary btn-sm" onclick="navigateTo('assignments')">View Assignments</button>
    </div>
  </div>

  <div class="stats-grid">
    ${statCard('📚', courses.length, 'Enrolled Courses', null, null, 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))')}
    ${statCard('⏳', pending.length, 'Pending Assignments', pending.length>0?'down':'up', pending.length>0?'Due soon':'All done!', 'linear-gradient(135deg,rgba(244,63,94,0.08),rgba(245,158,11,0.08))')}
    ${statCard('📊', avgAtt+'%', 'Avg. Attendance', avgAtt>=75?'up':'down', avgAtt>=75?'Good standing':'Below minimum', 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))')}
    ${statCard('🏆', gpa+'%', 'Overall Score', gpa>=70?'up':'down', graded.length+' assignments graded', 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.08))')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <!-- Upcoming Assignments -->
    <div class="card">
      <div class="card-body">
        <div class="section-header" style="margin-bottom:16px">
          <h2 class="section-title">Upcoming Deadlines</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('assignments')">View All</button>
        </div>
        ${pending.slice(0,4).map(a => {
          const course = DB.getCourseById(a.courseId);
          const dueDate = new Date(a.dueDate);
          const daysLeft = Math.ceil((dueDate - Date.now())/(1000*86400));
          const urgency = daysLeft<=3?'badge-rose':daysLeft<=7?'badge-amber':'badge-green';
          return `<div class="assignment-card" style="margin-bottom:8px;padding:12px 14px" onclick="openSubmitModal('${a.id}')">
            <div class="assignment-icon" style="width:36px;height:36px;font-size:16px">${a.type==='Coding'?'💻':a.type==='Project'?'🚀':a.type==='Report'?'📝':'🔬'}</div>
            <div class="assignment-info">
              <div class="assignment-title" style="font-size:0.84rem">${a.title}</div>
              <div style="font-size:11px;color:var(--text-muted)">${course?.code} &nbsp;|&nbsp; ${a.totalMarks} marks</div>
            </div>
            <span class="badge ${urgency}">${daysLeft>0?daysLeft+'d left':'Overdue'}</span>
          </div>`;
        }).join('') || '<div class="empty-state" style="padding:24px"><div class="empty-icon">✅</div><p>No pending assignments!</p></div>'}
      </div>
    </div>

    <!-- Attendance per course -->
    <div class="card">
      <div class="card-body">
        <div class="section-header" style="margin-bottom:16px">
          <h2 class="section-title">Attendance Summary</h2>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('attendance')">Details</button>
        </div>
        ${courses.map(c => {
          const recs = DB.getAttendanceForStudent(c.id, user.id);
          const pct  = DB.calcAttendancePct(recs);
          const color= pct>=75?'var(--accent-green)':pct>=60?'var(--accent-amber)':'var(--accent-rose)';
          return `<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <span style="font-size:0.84rem;font-weight:500">${c.code}</span>
              <span style="font-size:0.84rem;font-weight:700;color:${color}">${pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
            ${pct<75?`<div style="font-size:11px;color:var(--accent-rose);margin-top:2px">⚠️ Below 75% requirement</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- My Courses -->
  <div class="section-header">
    <h2 class="section-title">My Courses</h2>
    <button class="btn btn-secondary btn-sm" onclick="navigateTo('courses')">View All</button>
  </div>
  <div class="grid-2" style="margin-bottom:24px">
    ${courses.map(c => courseCard(c, user)).join('')}
  </div>

  <!-- Recent Announcements -->
  <div class="section-header">
    <h2 class="section-title">Recent Announcements</h2>
    <button class="btn btn-secondary btn-sm" onclick="navigateTo('announcements')">View All</button>
  </div>
  ${DB.announcements.filter(a=>courses.some(c=>c.id===a.courseId)).slice(0,3).map(a=>announcementCard(a)).join('')}`;
}

/* ════════════════════════════════════════════════════════
   2. COURSES
   ════════════════════════════════════════════════════════ */
VIEWS.courses = (user) => {
  const courses = user.role === 'teacher'
    ? DB.getCoursesForTeacher(user.id)
    : DB.getCoursesForStudent(user.id);

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">${user.role==='teacher'?'My Courses':'Enrolled Courses'}</h1>
      <p class="page-subtitle">${courses.length} course${courses.length!==1?'s':''} ${user.role==='teacher'?'you are teaching':'you are enrolled in'}</p>
    </div>
    ${user.role==='teacher'
      ? `<button class="btn btn-primary" onclick="openAddCourseModal()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Course</button>`
      : `<button class="btn btn-primary" onclick="openEnrollModal()">🎓 Enroll in Course</button>`}
  </div>
  ${courses.length
    ? `<div class="grid-2">${courses.map(c => courseCard(c, user, true)).join('')}</div>`
    : `<div class="empty-state"><div class="empty-icon">📚</div><h3>No courses yet</h3><p>${user.role==='teacher'?'Create your first course to get started.':'Enroll in a course to get started.'}</p>
       ${user.role==='teacher'
         ? `<button class="btn btn-primary" style="margin-top:16px" onclick="openAddCourseModal()">Create Course</button>`
         : `<button class="btn btn-primary" style="margin-top:16px" onclick="openEnrollModal()">Browse Courses</button>`}
       </div>`}`;
};

/* ════════════════════════════════════════════════════════
   3. ASSIGNMENTS
   ════════════════════════════════════════════════════════ */
VIEWS.assignments = (user) => {
  const isTeacher = user.role === 'teacher';
  const courses   = isTeacher ? DB.getCoursesForTeacher(user.id) : DB.getCoursesForStudent(user.id);
  const allAssigns = courses.flatMap(c => DB.getAssignmentsForCourse(c.id))
                     .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
  const active = allAssigns.filter(a => a.status === 'active');
  const past   = allAssigns.filter(a => a.status === 'past');

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Assignments</h1>
      <p class="page-subtitle">${active.length} active &nbsp;|&nbsp; ${past.length} past</p>
    </div>
    ${isTeacher ? `<button class="btn btn-primary" onclick="openAddAssignmentModal()">+ Post Assignment</button>` : ''}
  </div>

  <div class="tabs">
    <button class="tab-btn active" id="tab-active" onclick="switchTab('active')">Active (${active.length})</button>
    <button class="tab-btn" id="tab-past" onclick="switchTab('past')">Past (${past.length})</button>
    ${isTeacher ? `<button class="tab-btn" id="tab-all" onclick="switchTab('all')">All (${allAssigns.length})</button>` : ''}
  </div>

  <div class="tab-panel active" id="panel-active">
    ${active.length ? active.map(a => assignmentRow(a, user, courses)).join('') : emptyState('📋','No active assignments','All clear!')}
  </div>
  <div class="tab-panel" id="panel-past">
    ${past.length ? past.map(a => assignmentRow(a, user, courses)).join('') : emptyState('📋','No past assignments','')}
  </div>
  ${isTeacher ? `<div class="tab-panel" id="panel-all">${allAssigns.map(a => assignmentRow(a, user, courses)).join('')}</div>` : ''}`;
};

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-'+tab)?.classList.add('active');
  document.getElementById('panel-'+tab)?.classList.add('active');
}

function assignmentRow(a, user, courses) {
  const course   = courses.find(c => c.id === a.courseId);
  const dueDate  = new Date(a.dueDate);
  const daysLeft = Math.ceil((dueDate - Date.now())/(1000*86400));
  const isTeacher= user.role === 'teacher';
  const sub      = !isTeacher ? DB.submissions.find(s => s.assignmentId === a.id && s.studentId === user.id) : null;
  const subs     = isTeacher  ? DB.getSubmissionsForAssignment(a.id) : [];
  const typeIcons= { Coding:'💻', Project:'🚀', Report:'📝', Practical:'🔬', Quiz:'❓' };
  const statusBadge = isTeacher
    ? `<span class="badge ${a.status==='active'?'badge-green':'badge-amber'}">${a.status}</span>`
    : sub
      ? `<span class="badge ${sub.status==='graded'?'badge-green':'badge-blue'}">${sub.status==='graded'?`Graded: ${sub.marks}/${a.totalMarks}`:'Submitted'}</span>`
      : a.status==='active' ? `<span class="badge badge-rose">Not Submitted</span>` : `<span class="badge badge-amber">Missed</span>`;

  return `
  <div class="assignment-card" style="margin-bottom:12px">
    <div class="assignment-icon">${typeIcons[a.type]||'📋'}</div>
    <div class="assignment-info">
      <div class="assignment-title">${a.title}</div>
      <div class="assignment-meta">
        <span>📚 ${course?.code||'—'}</span>
        <span>🏷️ ${a.type}</span>
        <span>📅 Due: ${formatDate(a.dueDate)}</span>
        <span>⭐ ${a.totalMarks} marks</span>
        ${isTeacher ? `<span>📥 ${subs.length} submissions</span>` : ''}
      </div>
    </div>
    <div class="assignment-actions">
      ${statusBadge}
      ${isTeacher
        ? `<button class="btn btn-secondary btn-sm" onclick="openAddAssignmentModal('${a.courseId}')">Edit</button>
           <button class="btn btn-primary btn-sm" onclick="navigateTo('submissions')">View Subs</button>`
        : a.status==='active' && !sub
          ? `<button class="btn btn-primary btn-sm" onclick="openSubmitModal('${a.id}')">Submit</button>`
          : sub?.status==='graded' && sub.feedback
            ? `<button class="btn btn-secondary btn-sm" onclick="openFeedbackModal('${a.id}')">Feedback</button>`
            : ''}
    </div>
  </div>`;
}

function openFeedbackModal(assignmentId) {
  const sub  = DB.submissions.find(s => s.assignmentId === assignmentId && s.studentId === AppState.currentUser.id);
  const asgn = DB.getAssignmentById(assignmentId);
  const pct  = Math.round((sub.marks / asgn.totalMarks)*100);
  const color= pct>=80?'var(--accent-green)':pct>=60?'var(--accent-amber)':'var(--accent-rose)';
  openModal('Feedback & Grade', `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-family:var(--font-display);font-size:3rem;font-weight:800;color:${color}">${sub.marks}<span style="font-size:1.2rem;color:var(--text-muted)">/${asgn.totalMarks}</span></div>
      <div style="font-size:1rem;color:${color};font-weight:600">${pct}% — ${pct>=80?'Excellent':pct>=60?'Good':'Needs Improvement'}</div>
    </div>
    <div style="padding:16px;background:var(--bg-glass);border-radius:var(--radius-md);border-left:3px solid var(--accent-blue)">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Teacher Feedback</div>
      <p style="font-size:0.9rem;line-height:1.7;color:var(--text-primary)">${sub.feedback||'No feedback provided.'}</p>
    </div>`);
}

/* ════════════════════════════════════════════════════════
   4. SUBMISSIONS (Teacher)
   ════════════════════════════════════════════════════════ */
VIEWS.submissions = (user) => {
  if (user.role === 'student') return VIEWS['my-submissions'](user);
  const courses = DB.getCoursesForTeacher(user.id);
  const allSubs = DB.submissions.filter(s => {
    const asgn = DB.getAssignmentById(s.assignmentId);
    return courses.some(c => c.id === asgn?.courseId);
  });
  const pending = allSubs.filter(s => s.status === 'submitted');
  const graded  = allSubs.filter(s => s.status === 'graded');

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Submissions</h1>
      <p class="page-subtitle">${pending.length} pending &nbsp;|&nbsp; ${graded.length} graded</p>
    </div>
    <div class="filter-bar" style="margin:0">
      <select class="filter-select" id="sub-filter" onchange="filterSubmissions(this.value)">
        <option value="all">All Submissions</option>
        <option value="submitted">Pending Grading</option>
        <option value="graded">Graded</option>
      </select>
    </div>
  </div>

  <div class="table-wrapper">
    <table id="submissions-table">
      <thead><tr>
        <th>Student</th><th>Assignment</th><th>Course</th><th>Submitted</th><th>File</th><th>Status</th><th>Marks</th><th>Action</th>
      </tr></thead>
      <tbody id="sub-tbody">
        ${allSubs.map(s => submissionRow(s, courses)).join('')}
      </tbody>
    </table>
  </div>`;
};

function submissionRow(s, courses) {
  const stud = DB.getUserById(s.studentId);
  const asgn = DB.getAssignmentById(s.assignmentId);
  const course = courses.find(c => c.id === asgn?.courseId);
  return `
  <tr data-status="${s.status}">
    <td>
      <div style="display:flex;align-items:center;gap:10px">
        <div class="user-avatar-sm">${stud?.avatar||'?'}</div>
        <div>
          <div style="font-weight:600;font-size:0.875rem">${stud?.name||'—'}</div>
          <div style="font-size:11px;color:var(--text-muted)">${stud?.uid||''}</div>
        </div>
      </div>
    </td>
    <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${asgn?.title||'—'}</td>
    <td><span class="badge badge-blue">${course?.code||'—'}</span></td>
    <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(s.submittedAt)}</td>
    <td style="font-size:0.82rem">${s.fileName||'—'}</td>
    <td><span class="badge ${s.status==='graded'?'badge-green':'badge-amber'}">${s.status}</span></td>
    <td style="font-weight:700">${s.marks!=null?s.marks+'/'+(asgn?.totalMarks||'?'):'—'}</td>
    <td><button class="btn btn-primary btn-sm" onclick="openGradeModal('${s.id}')">${s.status==='graded'?'Re-grade':'Grade'}</button></td>
  </tr>`;
}

function filterSubmissions(val) {
  document.querySelectorAll('#sub-tbody tr').forEach(row => {
    row.style.display = (val === 'all' || row.dataset.status === val) ? '' : 'none';
  });
}

/* ════════════════════════════════════════════════════════
   5. MY SUBMISSIONS (Student)
   ════════════════════════════════════════════════════════ */
VIEWS['my-submissions'] = (user) => {
  const subs = DB.getSubmissionsForStudent(user.id);
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">My Submissions</h1>
      <p class="page-subtitle">${subs.length} submission${subs.length!==1?'s':''} total</p>
    </div>
  </div>
  ${subs.length ? `
  <div class="table-wrapper">
    <table>
      <thead><tr><th>Assignment</th><th>Course</th><th>Submitted</th><th>File</th><th>Status</th><th>Marks</th><th>Feedback</th></tr></thead>
      <tbody>
        ${subs.map(s => {
          const asgn   = DB.getAssignmentById(s.assignmentId);
          const course = DB.getCourseById(asgn?.courseId);
          return `<tr>
            <td style="font-weight:600;font-size:0.875rem">${asgn?.title||'—'}</td>
            <td><span class="badge badge-blue">${course?.code||'—'}</span></td>
            <td style="font-size:0.82rem;color:var(--text-secondary)">${formatDate(s.submittedAt)}</td>
            <td style="font-size:0.82rem">${s.fileName||'—'}</td>
            <td><span class="badge ${s.status==='graded'?'badge-green':'badge-amber'}">${s.status}</span></td>
            <td style="font-weight:700">${s.marks!=null?s.marks+'/'+(asgn?.totalMarks||'?'):'—'}</td>
            <td>${s.feedback?`<button class="btn btn-secondary btn-sm" onclick="openFeedbackModal('${s.assignmentId}')">View</button>`:'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>` : emptyState('📤','No submissions yet','Submit your first assignment to see it here.')}`;
};

/* ════════════════════════════════════════════════════════
   6. ANNOUNCEMENTS
   ════════════════════════════════════════════════════════ */
VIEWS.announcements = (user) => {
  const isTeacher = user.role === 'teacher';
  const courses   = isTeacher ? DB.getCoursesForTeacher(user.id) : DB.getCoursesForStudent(user.id);
  const anns = DB.announcements
    .filter(a => courses.some(c => c.id === a.courseId))
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const pinned = anns.filter(a => a.pinned);
  const regular= anns.filter(a => !a.pinned);

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Announcements</h1>
      <p class="page-subtitle">${anns.length} total &nbsp;|&nbsp; ${pinned.length} pinned</p>
    </div>
    ${isTeacher ? `<button class="btn btn-primary" onclick="openAddAnnouncementModal()">+ Post Announcement</button>` : ''}
  </div>
  ${pinned.length ? `
  <div class="section-header"><h2 class="section-title">📌 Pinned</h2></div>
  ${pinned.map(a => announcementCard(a, true)).join('')}
  <div style="height:8px"></div>` : ''}
  <div class="section-header"><h2 class="section-title">All Announcements</h2></div>
  ${regular.length ? regular.map(a => announcementCard(a)).join('') : emptyState('📢','No announcements yet','Check back later.')}`;
};

/* ════════════════════════════════════════════════════════
   7. STUDENTS (Teacher)
   ════════════════════════════════════════════════════════ */
VIEWS.students = (user) => {
  const courses  = DB.getCoursesForTeacher(user.id);
  const allStuIds= [...new Set(courses.flatMap(c => c.enrolledStudents))];
  const students = allStuIds.map(id => DB.getUserById(id)).filter(Boolean);

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Students</h1>
      <p class="page-subtitle">${students.length} students across all courses</p>
    </div>
    <div class="filter-bar" style="margin:0">
      <input type="text" class="form-input" placeholder="Search students…" oninput="filterStudentTable(this.value)" style="max-width:240px;padding:8px 14px;border:1px solid var(--border-normal);border-radius:var(--radius-md);background:var(--bg-glass);color:var(--text-primary);font-size:0.875rem"/>
      <select class="filter-select" onchange="filterStudentByCourse(this.value)">
        <option value="all">All Courses</option>
        ${courses.map(c=>`<option value="${c.id}">${c.code}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="table-wrapper">
    <table id="students-table">
      <thead><tr><th>Student</th><th>UID</th><th>Department</th><th>Courses Enrolled</th><th>Submissions</th><th>Avg. Attendance</th></tr></thead>
      <tbody>
        ${students.map(s => {
          const stuCourses = courses.filter(c => c.enrolledStudents.includes(s.id));
          const stuSubs    = DB.getSubmissionsForStudent(s.id);
          const attPct     = stuCourses.reduce((acc,c) => acc + DB.calcAttendancePct(DB.getAttendanceForStudent(c.id, s.id)), 0);
          const avgAtt     = stuCourses.length ? Math.round(attPct/stuCourses.length) : 0;
          const attColor   = avgAtt>=75?'#34d399':avgAtt>=60?'#fbbf24':'#fb7185';
          return `<tr data-name="${s.name.toLowerCase()}">
            <td>
              <div style="display:flex;align-items:center;gap:10px">
                <div class="user-avatar-sm">${s.avatar}</div>
                <div style="font-weight:600">${s.name}</div>
              </div>
            </td>
            <td style="font-family:monospace;font-size:0.82rem;color:var(--text-secondary)">${s.uid||'—'}</td>
            <td style="font-size:0.82rem;color:var(--text-secondary)">${s.department||'—'}</td>
            <td><span class="badge badge-blue">${stuCourses.length}</span></td>
            <td><span class="badge badge-purple">${stuSubs.length}</span></td>
            <td style="font-weight:700;color:${attColor}">${avgAtt}%</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
};

function filterStudentTable(val) {
  document.querySelectorAll('#students-table tbody tr').forEach(row => {
    row.style.display = row.dataset.name.includes(val.toLowerCase()) ? '' : 'none';
  });
}
function filterStudentByCourse(courseId) {
  // For now refresh table – in production would filter by course
  if (courseId === 'all') { filterStudentTable(''); return; }
  const course = DB.getCourseById(courseId);
  document.querySelectorAll('#students-table tbody tr').forEach((row,i) => {
    const allStuIds = [...new Set(DB.getCoursesForTeacher(AppState.currentUser.id).flatMap(c=>c.enrolledStudents))];
    const stu = DB.getUserById(allStuIds[i]);
    row.style.display = course?.enrolledStudents.includes(stu?.id) ? '' : 'none';
  });
}

/* ════════════════════════════════════════════════════════
   8. ATTENDANCE
   ════════════════════════════════════════════════════════ */
VIEWS.attendance = (user) => {
  const isTeacher = user.role === 'teacher';
  const courses   = isTeacher ? DB.getCoursesForTeacher(user.id) : DB.getCoursesForStudent(user.id);

  if (isTeacher) {
    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Attendance Management</h1>
        <p class="page-subtitle">Track and manage student attendance across all courses</p>
      </div>
    </div>
    ${courses.map(course => {
      const students = course.enrolledStudents.map(id => DB.getUserById(id)).filter(Boolean);
      return `
      <div class="card" style="margin-bottom:20px">
        <div class="card-body">
          <div class="section-header" style="margin-bottom:16px">
            <div>
              <h2 class="section-title">${course.name}</h2>
              <span class="badge badge-blue" style="margin-top:4px">${course.code}</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openAttendanceModal('${course.id}')">📅 Mark Today</button>
          </div>
          <div class="table-wrapper">
            <table>
              <thead><tr><th>Student</th><th>Present</th><th>Absent</th><th>Late</th><th>Attendance %</th></tr></thead>
              <tbody>
                ${students.map(s => {
                  const recs    = DB.getAttendanceForStudent(course.id, s.id);
                  const present = recs.filter(r=>r.status==='present').length;
                  const absent  = recs.filter(r=>r.status==='absent').length;
                  const late    = recs.filter(r=>r.status==='late').length;
                  const pct     = DB.calcAttendancePct(recs);
                  const color   = pct>=75?'#34d399':pct>=60?'#fbbf24':'#fb7185';
                  return `<tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="user-avatar-sm">${s.avatar}</div>
                        <div>
                          <div style="font-weight:600;font-size:0.875rem">${s.name}</div>
                          <div style="font-size:11px;color:var(--text-muted)">${s.uid||''}</div>
                        </div>
                      </div>
                    </td>
                    <td style="color:#34d399;font-weight:600">${present}</td>
                    <td style="color:#fb7185;font-weight:600">${absent}</td>
                    <td style="color:#fbbf24;font-weight:600">${late}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:10px">
                        <div class="progress-bar" style="width:80px"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
                        <span style="font-weight:700;color:${color}">${pct}%</span>
                      </div>
                    </td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    }).join('')}`;
  }

  // Student attendance view
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">My Attendance</h1>
      <p class="page-subtitle">Detailed attendance records across all your enrolled courses</p>
    </div>
  </div>
  ${courses.map(course => {
    const recs    = DB.getAttendanceForStudent(course.id, user.id);
    const pct     = DB.calcAttendancePct(recs);
    const present = recs.filter(r=>r.status==='present').length;
    const absent  = recs.filter(r=>r.status==='absent').length;
    const late    = recs.filter(r=>r.status==='late').length;
    const color   = pct>=75?'var(--accent-green)':pct>=60?'var(--accent-amber)':'var(--accent-rose)';
    return `
    <div class="card" style="margin-bottom:20px">
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px">
          <div>
            <h2 class="section-title">${course.name}</h2>
            <span class="badge badge-blue">${course.code}</span>
          </div>
          <div style="text-align:right">
            <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:${color}">${pct}%</div>
            <div style="font-size:0.78rem;color:var(--text-muted)">${pct>=75?'✅ Good Standing':'⚠️ At Risk'}</div>
          </div>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap">
          <div style="text-align:center;padding:12px 20px;background:rgba(16,185,129,0.1);border-radius:var(--radius-md);border:1px solid rgba(16,185,129,0.2)">
            <div style="font-size:1.5rem;font-weight:800;color:#34d399">${present}</div>
            <div style="font-size:11px;color:var(--text-muted)">Present</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:rgba(244,63,94,0.1);border-radius:var(--radius-md);border:1px solid rgba(244,63,94,0.2)">
            <div style="font-size:1.5rem;font-weight:800;color:#fb7185">${absent}</div>
            <div style="font-size:11px;color:var(--text-muted)">Absent</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:rgba(245,158,11,0.1);border-radius:var(--radius-md);border:1px solid rgba(245,158,11,0.2)">
            <div style="font-size:1.5rem;font-weight:800;color:#fbbf24">${late}</div>
            <div style="font-size:11px;color:var(--text-muted)">Late</div>
          </div>
          <div style="text-align:center;padding:12px 20px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
            <div style="font-size:1.5rem;font-weight:800;color:var(--text-primary)">${recs.length}</div>
            <div style="font-size:11px;color:var(--text-muted)">Total Classes</div>
          </div>
        </div>
        <h3 style="font-size:0.9rem;font-weight:600;margin-bottom:12px;color:var(--text-secondary)">Day-by-Day Calendar</h3>
        <div class="attendance-grid">
          ${recs.map(r => `
            <div class="att-day att-${r.status}" title="${r.date} – ${r.status}">
              ${new Date(r.date).getDate()}
            </div>`).join('')}
        </div>
        <div class="att-legend">
          <div class="att-legend-item"><div class="att-legend-dot" style="background:rgba(16,185,129,0.5)"></div>Present</div>
          <div class="att-legend-item"><div class="att-legend-dot" style="background:rgba(244,63,94,0.5)"></div>Absent</div>
          <div class="att-legend-item"><div class="att-legend-dot" style="background:rgba(245,158,11,0.5)"></div>Late</div>
        </div>
      </div>
    </div>`;
  }).join('')}`;
};

/* ════════════════════════════════════════════════════════
   9. ANALYTICS (Teacher)
   ════════════════════════════════════════════════════════ */
VIEWS.analytics = (user) => {
  const courses  = DB.getCoursesForTeacher(user.id);
  const allAssigns = courses.flatMap(c => DB.getAssignmentsForCourse(c.id));
  const allSubs  = DB.submissions.filter(s => {
    const asgn = DB.getAssignmentById(s.assignmentId);
    return courses.some(c => c.id === asgn?.courseId);
  });
  const graded   = allSubs.filter(s => s.status === 'graded');
  const avgScore = graded.length ? Math.round(graded.reduce((acc,s) => {
    const asgn = DB.getAssignmentById(s.assignmentId);
    return acc + (s.marks/asgn?.totalMarks)*100;
  },0) / graded.length) : 0;

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Analytics</h1>
      <p class="page-subtitle">Insights and performance metrics across all your courses</p>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:28px">
    ${statCard('📚', courses.length, 'Total Courses', null, null, 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))')}
    ${statCard('📋', allAssigns.length, 'Total Assignments', null, null, 'linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))')}
    ${statCard('📥', allSubs.length, 'Total Submissions', null, null, 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.08))')}
    ${statCard('📊', avgScore+'%', 'Avg. Student Score', avgScore>=70?'up':'down', 'Across all graded work', 'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(244,63,94,0.08))')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
    <div class="card">
      <div class="card-body">
        <h2 class="section-title" style="margin-bottom:20px">Student Enrollment per Course</h2>
        <div class="bar-chart">
          ${courses.map(c => {
            const pct = Math.round((c.enrolledStudents.length/c.maxStudents)*100);
            return `<div class="bar-chart-col">
              <div class="bar-val">${c.enrolledStudents.length}</div>
              <div class="bar-wrap"><div class="bar" style="height:${Math.max(pct,5)}%;background:${c.color}"></div></div>
              <div class="bar-label">${c.code}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="section-title" style="margin-bottom:20px">Submission Status</h2>
        <div class="donut-wrap">
          <div class="donut" style="background:conic-gradient(#10b981 0% ${graded.length/Math.max(allSubs.length,1)*100}%, #3b82f6 ${graded.length/Math.max(allSubs.length,1)*100}% ${allSubs.length/Math.max(allSubs.length,1)*100}%, var(--bg-glass) ${allSubs.length/Math.max(allSubs.length,1)*100}% 100%)">
            <div class="donut-center">
              <div class="donut-pct gradient-text">${allSubs.length}</div>
              <div class="donut-sub">Total</div>
            </div>
          </div>
          <div class="donut-legend">
            <div class="donut-legend-item"><div class="donut-legend-color" style="background:#10b981"></div><span>${graded.length} Graded</span></div>
            <div class="donut-legend-item"><div class="donut-legend-color" style="background:#3b82f6"></div><span>${allSubs.filter(s=>s.status==='submitted').length} Pending</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-body">
      <h2 class="section-title" style="margin-bottom:20px">Course Progress Overview</h2>
      ${courses.map(c => {
        const assigns = DB.getAssignmentsForCourse(c.id);
        const subs    = DB.submissions.filter(s => assigns.some(a => a.id === s.assignmentId));
        return `
        <div style="margin-bottom:20px;padding:16px;background:var(--bg-glass);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
            <div>
              <span class="badge badge-blue" style="margin-right:8px">${c.code}</span>
              <strong>${c.name}</strong>
            </div>
            <div style="display:flex;gap:16px;font-size:0.82rem;color:var(--text-muted)">
              <span>👥 ${c.enrolledStudents.length} students</span>
              <span>📋 ${assigns.length} assignments</span>
              <span>📥 ${subs.length} submissions</span>
            </div>
          </div>
          <div class="progress-label"><span>Class Progress</span><span>${Math.round((c.completedClasses/Math.max(c.totalClasses,1))*100)}%</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.round((c.completedClasses/Math.max(c.totalClasses,1))*100)}%"></div></div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};

/* ════════════════════════════════════════════════════════
   10. GRADES (Student)
   ════════════════════════════════════════════════════════ */
VIEWS.grades = (user) => {
  const courses  = DB.getCoursesForStudent(user.id);
  const subs     = DB.getSubmissionsForStudent(user.id).filter(s => s.status === 'graded');
  let totalEarned = 0, totalPossible = 0;
  const rows = subs.map(s => {
    const asgn   = DB.getAssignmentById(s.assignmentId);
    const course  = DB.getCourseById(asgn?.courseId);
    const pct     = Math.round((s.marks/asgn?.totalMarks)*100);
    totalEarned  += s.marks||0;
    totalPossible += asgn?.totalMarks||0;
    const grade   = pct>=90?'A+':pct>=80?'A':pct>=70?'B':pct>=60?'C':'D';
    const color   = pct>=80?'#34d399':pct>=60?'#fbbf24':'#fb7185';
    return { asgn, course, pct, grade, color, s };
  });
  const overall = totalPossible ? Math.round((totalEarned/totalPossible)*100) : 0;

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">My Grades</h1>
      <p class="page-subtitle">${subs.length} assignments graded &nbsp;|&nbsp; Overall: ${overall}%</p>
    </div>
  </div>

  <!-- Overall GPA Card -->
  <div class="card" style="margin-bottom:24px;background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))">
    <div class="card-body" style="display:flex;align-items:center;gap:28px;flex-wrap:wrap">
      <div style="text-align:center;min-width:120px">
        <div style="font-family:var(--font-display);font-size:3.5rem;font-weight:900;" class="gradient-text">${overall}%</div>
        <div style="font-size:0.85rem;color:var(--text-muted)">Overall Score</div>
      </div>
      <div style="flex:1;min-width:200px">
        <div class="progress-label"><span>Score Progress</span><span>${totalEarned} / ${totalPossible} marks</span></div>
        <div class="progress-bar" style="height:10px;margin-bottom:8px"><div class="progress-fill" style="width:${overall}%"></div></div>
        <div style="font-size:0.82rem;color:var(--text-secondary)">
          ${overall>=80?'🌟 Excellent performance! Keep it up!':overall>=60?'👍 Good work. Keep pushing!':'📈 Focus on upcoming assignments to improve.'}
        </div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap">
        ${['A+:90','A:80','B:70','C:60'].map(g => {
          const [letter,min] = g.split(':');
          return `<div style="text-align:center;padding:10px 14px;background:var(--bg-glass);border-radius:var(--radius-md)">
            <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:700">${letter}</div>
            <div style="font-size:11px;color:var(--text-muted)">≥${min}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  ${rows.length ? `
  <div class="table-wrapper">
    <table>
      <thead><tr><th>Assignment</th><th>Course</th><th>Marks</th><th>Score</th><th>Grade</th><th>Feedback</th></tr></thead>
      <tbody>
        ${rows.map(({asgn,course,pct,grade,color,s}) => `<tr>
          <td style="font-weight:600">${asgn?.title||'—'}</td>
          <td><span class="badge badge-blue">${course?.code||'—'}</span></td>
          <td style="font-weight:700">${s.marks} / ${asgn?.totalMarks}</td>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="progress-bar" style="width:60px"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>
              <span style="font-weight:700;color:${color}">${pct}%</span>
            </div>
          </td>
          <td><span class="badge" style="background:${color}22;color:${color};border-color:${color}44">${grade}</span></td>
          <td>${s.feedback?`<button class="btn btn-secondary btn-sm" onclick="openFeedbackModal('${asgn.id}')">View</button>`:'—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : emptyState('🏆','No grades yet','Your graded assignments will appear here.')}`;
};

/* ════════════════════════════════════════════════════════
   11. ENROLL (Student)
   ════════════════════════════════════════════════════════ */
VIEWS.enroll = (user) => {
  const enrolled   = DB.getCoursesForStudent(user.id).map(c => c.id);
  const available  = DB.courses.filter(c => !enrolled.includes(c.id));
  const teacher    = DB.getUserById('u1');

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Browse & Enroll</h1>
      <p class="page-subtitle">${available.length} course${available.length!==1?'s':''} available for enrollment</p>
    </div>
  </div>
  ${available.length ? `
  <div class="grid-2">
    ${available.map(c => `
      <div class="card">
        <div class="course-card-banner" style="background:${c.color}"></div>
        <div class="card-body">
          <div class="course-meta">
            <span class="badge badge-blue">${c.code}</span>
            <span class="badge badge-purple">${c.credits} Credits</span>
            ${(c.tags||[]).map(t=>`<span class="badge badge-cyan">${t}</span>`).join('')}
          </div>
          <div class="course-title">${c.name}</div>
          <div class="course-desc">${c.description}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:0.82rem;color:var(--text-secondary)">
            <div class="user-avatar-sm" style="width:24px;height:24px;font-size:10px">${teacher?.avatar||'T'}</div>
            ${teacher?.name||'Instructor'}
          </div>
          <div class="course-stats">
            <div class="course-stat">📅 ${c.schedule||'TBA'}</div>
            <div class="course-stat">👥 ${c.enrolledStudents.length}/${c.maxStudents}</div>
            <div class="course-stat">🏛️ ${c.room||'TBA'}</div>
          </div>
        </div>
        <div class="card-footer">
          <span style="font-size:0.82rem;color:var(--text-muted)">${c.totalClasses} total classes</span>
          <button class="btn btn-primary btn-sm" onclick="doEnroll('${c.id}')">Enroll Now</button>
        </div>
      </div>`).join('')}
  </div>` : `<div class="empty-state"><div class="empty-icon">🎓</div><h3>All caught up!</h3><p>You are already enrolled in all available courses.</p></div>`}`;
};

/* ════════════════════════════════════════════════════════
   12. PROFILE
   ════════════════════════════════════════════════════════ */
VIEWS.profile = (user) => {
  const isTeacher = user.role === 'teacher';
  const courses   = isTeacher ? DB.getCoursesForTeacher(user.id) : DB.getCoursesForStudent(user.id);
  const subs      = DB.getSubmissionsForStudent(user.id);

  return `
  <div class="page-header">
    <div><h1 class="page-title">Profile</h1></div>
    <button class="btn btn-secondary" onclick="openEditProfileModal()">✏️ Edit Profile</button>
  </div>

  <div class="profile-card" style="margin-bottom:24px">
    <div class="profile-banner"></div>
    <div style="position:relative">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar">${user.avatar}</div>
      </div>
    </div>
    <div class="profile-info">
      <div class="profile-name">${user.name}</div>
      <div class="profile-sub">${isTeacher?`👨‍🏫 ${user.department}`:`🎓 ${user.uid} — ${user.department}, Sem ${user.semester}`}</div>
      <div style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap">
        <span class="badge ${isTeacher?'badge-blue':'badge-green'}">${isTeacher?'Teacher':'Student'}</span>
        <span class="badge badge-purple">📧 ${user.email}</span>
        ${user.phone ? `<span class="badge badge-cyan">📞 ${user.phone}</span>` : ''}
        <span class="badge badge-amber">📅 Joined ${formatDate(user.joinDate)}</span>
      </div>
      ${user.bio ? `<p style="margin-top:16px;font-size:0.875rem;color:var(--text-secondary);line-height:1.7;max-width:600px">${user.bio}</p>` : ''}
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-val gradient-text">${courses.length}</div>
          <div class="profile-stat-label">${isTeacher?'Courses Taught':'Courses Enrolled'}</div>
        </div>
        ${isTeacher
          ? `<div class="profile-stat">
               <div class="profile-stat-val gradient-text">${[...new Set(courses.flatMap(c=>c.enrolledStudents))].length}</div>
               <div class="profile-stat-label">Total Students</div>
             </div>
             <div class="profile-stat">
               <div class="profile-stat-val gradient-text">${courses.flatMap(c=>DB.getAssignmentsForCourse(c.id)).length}</div>
               <div class="profile-stat-label">Assignments Posted</div>
             </div>`
          : `<div class="profile-stat">
               <div class="profile-stat-val gradient-text">${subs.length}</div>
               <div class="profile-stat-label">Assignments Submitted</div>
             </div>
             <div class="profile-stat">
               <div class="profile-stat-val gradient-text">${subs.filter(s=>s.status==='graded').length}</div>
               <div class="profile-stat-label">Graded</div>
             </div>`}
      </div>
    </div>
  </div>

  <!-- Enrolled/Teaching Courses -->
  <div class="section-header">
    <h2 class="section-title">${isTeacher?'Courses You Teach':'Your Enrolled Courses'}</h2>
  </div>
  <div class="grid-2">
    ${courses.map(c => courseCard(c, user)).join('')}
  </div>`;
};

function openEditProfileModal() {
  const u = AppState.currentUser;
  pendingProfileImage = u.profileImage || null;
  removeProfileImage = false;
  pendingProfileBackground = u.profileBackground || null;
  removeProfileBackground = false;
  openModal('Edit Profile', `
    <form class="modal-form" onsubmit="saveProfile(event)">
      <div class="form-group">
        <label class="form-label">Profile Photo</label>
        <div class="profile-photo-controls">
          <div id="ep-avatar-preview" class="profile-photo-preview">${u.avatar}</div>
          <div class="profile-photo-actions">
            <label class="btn btn-secondary btn-sm" for="ep-photo">Choose Photo</label>
            <input id="ep-photo" class="profile-photo-input" type="file" accept="image/*" onchange="previewProfilePhoto(event)"/>
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeProfilePhoto()">Remove Photo</button>
            <span class="form-hint">Images are resized before saving. Maximum upload size: 10 MB.</span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Profile Background Image</label>
        <div id="ep-background-preview" class="profile-background-preview">
          <span>Profile cover preview</span>
        </div>
        <div class="profile-photo-actions" style="margin-top:10px">
          <label class="btn btn-secondary btn-sm" for="ep-background">Choose Background</label>
          <input id="ep-background" class="profile-photo-input" type="file" accept="image/*" onchange="previewProfileBackground(event)"/>
          <button type="button" class="btn btn-secondary btn-sm" onclick="removeProfileBackgroundImage()">Remove Background</button>
          <span class="form-hint">Choose a wide image. It will be resized before saving (max 10 MB).</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <div class="input-wrapper"><input id="ep-name" type="text" class="form-input" value="${u.name}" required/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Phone</label>
        <div class="input-wrapper"><input id="ep-phone" type="tel" class="form-input" value="${u.phone||''}"/></div>
      </div>
      <div class="form-group">
        <label class="form-label">Bio</label>
        <div class="input-wrapper"><textarea id="ep-bio" class="form-input" rows="4">${u.bio||''}</textarea></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>`);
  applyAvatar(document.getElementById('ep-avatar-preview'), u);
  applyProfileBackground(document.getElementById('ep-background-preview'), u);
}

function previewProfilePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  processProfileImage(file, 512, imageData => {
    pendingProfileImage = imageData;
    removeProfileImage = false;
    applyAvatar(document.getElementById('ep-avatar-preview'), {
      ...AppState.currentUser,
      profileImage: imageData
    });
  });
}

function previewProfileBackground(event) {
  const file = event.target.files[0];
  if (!file) return;
  processProfileImage(file, 1600, imageData => {
    pendingProfileBackground = imageData;
    removeProfileBackground = false;
    applyProfileBackground(document.getElementById('ep-background-preview'), {
      ...AppState.currentUser,
      profileBackground: imageData
    });
  });
}

function processProfileImage(file, maxDimension, onProcessed) {
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    showToast('Choose a JPEG, PNG, WebP, or GIF image.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('The selected image is larger than 10 MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onerror = () => showToast('Unable to read the selected image.', 'error');
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => showToast('The selected file is not a supported image.', 'error');
    image.onload = () => {
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        showToast('Unable to process the selected image.', 'error');
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      try {
        onProcessed(canvas.toDataURL('image/jpeg', 0.82));
      } catch (error) {
        console.error('Unable to resize the selected image.', error);
        showToast('Unable to process this image. Try another photo.', 'error');
      }
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function removeProfilePhoto() {
  pendingProfileImage = null;
  removeProfileImage = true;
  document.getElementById('ep-photo').value = '';
  applyAvatar(document.getElementById('ep-avatar-preview'), {
    ...AppState.currentUser,
    profileImage: null
  });
}

function removeProfileBackgroundImage() {
  pendingProfileBackground = null;
  removeProfileBackground = true;
  document.getElementById('ep-background').value = '';
  applyProfileBackground(document.getElementById('ep-background-preview'), {
    ...AppState.currentUser,
    profileBackground: null
  });
}

function saveProfile(e) {
  e.preventDefault();
  const u = AppState.currentUser;
  const dbUser = DB.users.find(x => x.id === u.id);
  const previous = { ...u };
  u.name  = document.getElementById('ep-name').value.trim();
  u.phone = document.getElementById('ep-phone').value.trim();
  u.bio   = document.getElementById('ep-bio').value.trim();
  if (pendingProfileImage) u.profileImage = pendingProfileImage;
  else if (removeProfileImage) delete u.profileImage;
  if (pendingProfileBackground) u.profileBackground = pendingProfileBackground;
  else if (removeProfileBackground) delete u.profileBackground;
  if (dbUser) Object.assign(dbUser, u);
  try {
    DB.save();
  } catch (error) {
    const restoreUser = target => {
      Object.keys(target).forEach(key => delete target[key]);
      Object.assign(target, previous);
    };
    restoreUser(u);
    if (dbUser && dbUser !== u) restoreUser(dbUser);
    console.error('Unable to save profile changes.', error);
    showToast('Unable to save your profile. Try a smaller photo or free browser storage.', 'error');
    return;
  }
  sessionStorage.setItem('cs_user', JSON.stringify(u));
  document.getElementById('topbar-name').textContent = u.name.split(' ')[0];
  document.getElementById('user-name-sm').textContent = u.name;
  applyAvatar(document.getElementById('topbar-avatar'), u);
  applyAvatar(document.getElementById('user-avatar-sm'), u);
  applyProfileBackground(document.querySelector('.profile-banner'), u);
  pendingProfileImage = null;
  removeProfileImage = false;
  pendingProfileBackground = null;
  removeProfileBackground = false;
  closeModal();
  showToast('Profile updated successfully!', 'success');
  navigateTo('profile');
}

/* ════════════════════════════════════════════════════════
   SHARED COMPONENT RENDERERS
   ════════════════════════════════════════════════════════ */
function statCard(icon, value, label, trendDir, trendText, bg) {
  const trendHtml = trendDir && trendText
    ? `<div class="stat-change ${trendDir}">
         ${trendDir==='up'?'↑':'↓'} ${trendText}
       </div>` : '';
  return `
  <div class="stat-card" style="--card-accent-color:${bg}">
    <div class="stat-icon" style="background:${bg}">${icon}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
    ${trendHtml}
  </div>`;
}

function courseCard(c, user, detailed=false) {
  const isTeacher = user.role === 'teacher';
  const pct       = Math.round((c.completedClasses/Math.max(c.totalClasses,1))*100);
  const teacher   = DB.getUserById(c.teacherId);
  const assigns   = DB.getAssignmentsForCourse(c.id);
  return `
  <div class="card" onclick="viewCourseDetail('${c.id}')" style="cursor:pointer">
    <div class="course-card-banner" style="background:${c.color}"></div>
    <div class="card-body">
      <div class="course-meta">
        <span class="badge badge-blue">${c.code}</span>
        <span class="badge badge-purple">${c.credits} Cr</span>
        ${(c.tags||[]).slice(0,2).map(t=>`<span class="badge badge-cyan">${t}</span>`).join('')}
      </div>
      <div class="course-title">${c.name}</div>
      <div class="course-desc">${c.description}</div>
      <div class="progress-bar-wrapper">
        <div class="progress-label"><span>Progress</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="course-stats">
        <div class="course-stat">👥 ${c.enrolledStudents.length} students</div>
        <div class="course-stat">📋 ${assigns.length} assignments</div>
        ${detailed ? `<div class="course-stat">🏛️ ${c.room||'TBA'}</div>` : ''}
      </div>
    </div>
    <div class="card-footer">
      <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;color:var(--text-muted)">
        ${isTeacher ? '' : `<div class="user-avatar-sm" style="width:22px;height:22px;font-size:9px">${teacher?.avatar||'T'}</div> ${teacher?.name?.split(' ')[0]||'—'}`}
      </div>
      ${isTeacher
        ? `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openAddAssignmentModal('${c.id}')">+ Assignment</button>`
        : `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();navigateTo('attendance')">My Attendance</button>`}
    </div>
  </div>`;
}

function announcementCard(a, highlighted=false) {
  const teacher  = DB.getUserById(a.teacherId);
  const priColor = a.priority==='high'?'var(--accent-rose)':a.priority==='medium'?'var(--accent-amber)':'var(--accent-green)';
  const priLabel = a.priority==='high'?'🔴 High':a.priority==='medium'?'🟡 Medium':'🟢 Low';
  return `
  <div class="announcement-item" style="${highlighted?'border-left-color:var(--accent-violet)':''}">
    <div class="announcement-header">
      <div>
        ${a.pinned?`<span style="font-size:11px;color:var(--accent-violet);display:block;margin-bottom:4px">📌 Pinned</span>`:''}
        <div class="announcement-title">${a.title}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
        <span class="badge badge-blue">${a.courseCode}</span>
        <span class="badge" style="background:${priColor}22;color:${priColor};border-color:${priColor}44">${priLabel}</span>
      </div>
    </div>
    <div class="announcement-body">${a.body}</div>
    <div class="announcement-footer">
      <div class="announcement-author">
        <div class="user-avatar-sm" style="width:22px;height:22px;font-size:9px">${teacher?.avatar||'T'}</div>
        ${teacher?.name||'Teacher'}
      </div>
      <span style="font-size:11px;color:var(--text-muted)">${timeAgo(a.createdAt)}</span>
    </div>
  </div>`;
}

function renderBarChart(courses) {
  const maxStud = Math.max(...courses.map(c=>c.enrolledStudents.length),1);
  return `
  <div class="bar-chart">
    ${courses.map(c => {
      const pct = Math.round((c.enrolledStudents.length/maxStud)*100);
      return `<div class="bar-chart-col">
        <div class="bar-val">${c.enrolledStudents.length}</div>
        <div class="bar-wrap"><div class="bar" style="height:${Math.max(pct,5)}%;background:${c.color}"></div></div>
        <div class="bar-label">${c.code}</div>
      </div>`;
    }).join('')}
  </div>`;
}

function emptyState(icon, title, desc) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p></div>`;
}
