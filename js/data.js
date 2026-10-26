/* ================================================================
   ClassSphere – Data Layer  (Mock Database)
   Author : Shibaji Biswas
   ================================================================ */

const DB = {

  /* ─── USERS ─── */
  users: [
    {
      id: 'u1', role: 'teacher', name: 'Dr. Arjun Sharma',
      email: 'teacher@classsphere.edu', password: 'teacher123',
      department: 'Computer Science', phone: '+91 98765 43210',
      bio: 'PhD in Computer Science from IIT Delhi. 12+ years of teaching experience in Data Structures, Algorithms, and Machine Learning.',
      joinDate: '2015-08-01', avatar: 'AS'
    },
    {
      id: 'u2', role: 'student', name: 'Shibaji Biswas',
      email: 'student@classsphere.edu', password: 'student123',
      uid: 'DEMO-001', department: 'B.Tech AI & ML', semester: '3rd',
      phone: '+91 91234 56789',
      bio: 'Passionate about Artificial Intelligence and Machine Learning. Enthusiastic about building impactful EdTech solutions.',
      joinDate: '2024-08-10', avatar: 'SB'
    },
    { id: 'u3', role: 'student', name: 'Priya Mehta',       email:'priya@classsphere.edu',   uid:'24BAI71019', department:'B.Tech AI & ML', semester:'3rd', avatar:'PM' },
    { id: 'u4', role: 'student', name: 'Rahul Gupta',       email:'rahul@classsphere.edu',   uid:'24BAI71020', department:'B.Tech CSE',     semester:'3rd', avatar:'RG' },
    { id: 'u5', role: 'student', name: 'Ananya Patel',      email:'ananya@classsphere.edu',  uid:'24BAI71021', department:'B.Tech AI & ML', semester:'3rd', avatar:'AP' },
    { id: 'u6', role: 'student', name: 'Vikram Nair',       email:'vikram@classsphere.edu',  uid:'24BAI71022', department:'B.Tech CSE',     semester:'3rd', avatar:'VN' },
    { id: 'u7', role: 'student', name: 'Meera Krishnan',    email:'meera@classsphere.edu',   uid:'24BAI71023', department:'B.Tech AI & ML', semester:'3rd', avatar:'MK' },
    { id: 'u8', role: 'student', name: 'Aryan Singh',       email:'aryan@classsphere.edu',   uid:'24BAI71024', department:'B.Tech CSE',     semester:'3rd', avatar:'AS' },
    { id: 'u9', role: 'student', name: 'Divya Rajan',       email:'divya@classsphere.edu',   uid:'24BAI71025', department:'B.Tech AI & ML', semester:'3rd', avatar:'DR' },
    { id: 'u10',role: 'student', name: 'Karthik Menon',     email:'karthik@classsphere.edu', uid:'24BAI71026', department:'B.Tech CSE',     semester:'3rd', avatar:'KM' },
  ],

  /* ─── COURSES ─── */
  courses: [
    {
      id: 'c1', teacherId: 'u1', code: 'CS301',
      name: 'Data Structures & Algorithms',
      description: 'Comprehensive study of fundamental data structures (arrays, linked lists, trees, graphs) and algorithm design paradigms including dynamic programming, greedy algorithms, and divide-and-conquer.',
      color: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      credits: 4, schedule: 'Mon/Wed/Fri 10:00–11:00 AM', room: 'LH-101',
      totalClasses: 42, completedClasses: 28, maxStudents: 60,
      enrolledStudents: ['u2','u3','u4','u5','u6','u7','u8','u9','u10'],
      tags: ['Core', 'Algorithms']
    },
    {
      id: 'c2', teacherId: 'u1', code: 'AI401',
      name: 'Machine Learning Fundamentals',
      description: 'Introduction to supervised and unsupervised learning, neural networks, model evaluation, and hands-on implementation using Python and scikit-learn.',
      color: 'linear-gradient(135deg,#10b981,#06b6d4)',
      credits: 4, schedule: 'Tue/Thu 2:00–3:30 PM', room: 'LH-205',
      totalClasses: 36, completedClasses: 20, maxStudents: 50,
      enrolledStudents: ['u2','u3','u5','u7','u9'],
      tags: ['AI/ML', 'Elective']
    },
    {
      id: 'c3', teacherId: 'u1', code: 'CS201',
      name: 'Database Management Systems',
      description: 'Relational databases, SQL, normalization, transaction management, concurrency control, and introduction to NoSQL databases.',
      color: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      credits: 3, schedule: 'Mon/Thu 12:00–1:00 PM', room: 'LH-108',
      totalClasses: 30, completedClasses: 18, maxStudents: 55,
      enrolledStudents: ['u2','u4','u6','u8','u10'],
      tags: ['Core', 'Database']
    },
    {
      id: 'c4', teacherId: 'u1', code: 'CS401',
      name: 'Cloud Computing & DevOps',
      description: 'Cloud architecture, AWS/Azure services, containerization with Docker, Kubernetes, CI/CD pipelines and infrastructure as code.',
      color: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      credits: 3, schedule: 'Wed/Fri 3:00–4:30 PM', room: 'Lab-B2',
      totalClasses: 28, completedClasses: 10, maxStudents: 40,
      enrolledStudents: ['u2','u3','u4','u5'],
      tags: ['Elective', 'Cloud']
    }
  ],

  /* ─── ASSIGNMENTS ─── */
  assignments: [
    {
      id: 'a1', courseId: 'c1', title: 'Binary Search Tree Implementation',
      description: 'Implement a complete Binary Search Tree with insert, delete, search, and all traversal methods (inorder, preorder, postorder). Analyze time and space complexity for each operation.',
      type: 'Coding', dueDate: '2024-11-15', totalMarks: 50, publishedDate: '2024-11-01',
      status: 'active', attachments: ['BST_requirements.pdf']
    },
    {
      id: 'a2', courseId: 'c1', title: 'Graph Algorithms – Dijkstra & BFS',
      description: 'Implement Dijkstra\'s shortest path and BFS algorithms. Apply them to solve real-world routing problems. Submit code + report.',
      type: 'Coding', dueDate: '2024-11-25', totalMarks: 60, publishedDate: '2024-11-08',
      status: 'active', attachments: []
    },
    {
      id: 'a3', courseId: 'c2', title: 'Linear Regression from Scratch',
      description: 'Implement linear regression using only NumPy (no sklearn). Train on a provided dataset, evaluate using MSE and R² score, and plot results.',
      type: 'Project', dueDate: '2024-11-20', totalMarks: 100, publishedDate: '2024-11-02',
      status: 'active', attachments: ['dataset.csv']
    },
    {
      id: 'a4', courseId: 'c3', title: 'Database Design Project – E-Commerce',
      description: 'Design an ER diagram for an e-commerce platform. Implement in MySQL with proper normalization up to 3NF. Write complex queries for reporting.',
      type: 'Project', dueDate: '2024-11-10', totalMarks: 80, publishedDate: '2024-10-28',
      status: 'past', attachments: ['ER_guide.pdf']
    },
    {
      id: 'a5', courseId: 'c4', title: 'Docker Container Deployment',
      description: 'Containerize a Node.js application using Docker. Write a docker-compose file to orchestrate multiple services (app + database + nginx). Deploy on a free cloud tier.',
      type: 'Practical', dueDate: '2024-12-01', totalMarks: 75, publishedDate: '2024-11-05',
      status: 'active', attachments: []
    },
    {
      id: 'a6', courseId: 'c1', title: 'Sorting Algorithm Analysis',
      description: 'Compare QuickSort, MergeSort, HeapSort and TimSort. Implement all, run benchmarks, and write a detailed performance analysis report.',
      type: 'Report', dueDate: '2024-10-30', totalMarks: 40, publishedDate: '2024-10-15',
      status: 'past', attachments: []
    }
  ],

  /* ─── SUBMISSIONS ─── */
  submissions: [
    { id: 's1', assignmentId: 'a4', studentId: 'u2', submittedAt: '2024-11-09T14:30:00', content: 'ER Diagram and MySQL scripts submitted.', fileName: 'ecommerce_db.zip', marks: null, feedback: '', status: 'submitted' },
    { id: 's2', assignmentId: 'a4', studentId: 'u4', submittedAt: '2024-11-10T09:15:00', content: 'E-Commerce DB with triggers and stored procedures.', fileName: 'rahul_db_project.zip', marks: 72, feedback: 'Excellent normalization. Stored procedures are well-written. Minor issue in ER notation.', status: 'graded' },
    { id: 's3', assignmentId: 'a6', studentId: 'u2', submittedAt: '2024-10-29T18:00:00', content: 'Sorting analysis report with benchmark graphs.', fileName: 'sorting_analysis.pdf', marks: 36, feedback: 'Very well presented. TimSort analysis was insightful. Add more edge cases next time.', status: 'graded' },
    { id: 's4', assignmentId: 'a6', studentId: 'u3', submittedAt: '2024-10-30T11:45:00', content: 'Complete sorting benchmarks included.', fileName: 'priya_sorting.pdf', marks: 38, feedback: 'Outstanding work! Excellent graph analysis.', status: 'graded' },
    { id: 's5', assignmentId: 'a1', studentId: 'u2', submittedAt: '2024-11-14T20:00:00', content: 'BST with all operations. Time complexities in README.', fileName: 'BST_shibaji.zip', marks: null, feedback: '', status: 'submitted' },
  ],

  /* ─── ANNOUNCEMENTS ─── */
  announcements: [
    {
      id: 'an1', courseId: 'c1', teacherId: 'u1', title: 'Mid-Semester Exam – Schedule & Syllabus',
      body: 'The mid-semester examination for DS&A will be held on November 28th, 2024 (10:00 AM – 12:00 PM) in Hall A. The syllabus covers Units 1–4: Arrays, Linked Lists, Stacks, Queues, Trees, and Graphs. Please bring your ID cards. No electronic devices allowed.',
      priority: 'high', createdAt: '2024-11-10T09:00:00', pinned: true, courseCode: 'CS301'
    },
    {
      id: 'an2', courseId: 'c2', teacherId: 'u1', title: 'Guest Lecture: AI in Healthcare',
      body: 'We are delighted to host Dr. Neeha Verma from AIIMS Delhi for a special guest lecture on "Applications of AI in Medical Diagnostics". Date: November 18th, 3:00 PM, Seminar Hall. Attendance is mandatory for ML Fundamentals students.',
      priority: 'medium', createdAt: '2024-11-08T14:00:00', pinned: false, courseCode: 'AI401'
    },
    {
      id: 'an3', courseId: 'c3', teacherId: 'u1', title: 'Lab Session Rescheduled',
      body: 'The DBMS lab session originally scheduled for November 12th has been rescheduled to November 14th (2:00 PM – 4:00 PM) in Lab B1. Please update your timetables accordingly.',
      priority: 'low', createdAt: '2024-11-07T11:30:00', pinned: false, courseCode: 'CS201'
    },
    {
      id: 'an4', courseId: 'c1', teacherId: 'u1', title: 'Assignment 1 Grading Complete',
      body: 'Grades for the Sorting Algorithm Analysis assignment have been published. You can view your scores and feedback in the Assignments section. Average score: 34/40. Great work everyone! Please review the feedback before the next assignment.',
      priority: 'medium', createdAt: '2024-11-05T16:00:00', pinned: false, courseCode: 'CS301'
    },
    {
      id: 'an5', courseId: 'c4', teacherId: 'u1', title: 'Cloud Lab Access Credentials',
      body: 'AWS Educate accounts have been created for all enrolled students. Credentials have been sent to your registered email IDs. You will receive $100 in free credits for lab exercises. Please activate within 7 days.',
      priority: 'high', createdAt: '2024-11-03T10:00:00', pinned: true, courseCode: 'CS401'
    }
  ],

  /* ─── ATTENDANCE ─── */
  attendance: {
    'c1': {
      'u2': [
        {date:'2024-10-01',status:'present'},{date:'2024-10-02',status:'present'},{date:'2024-10-04',status:'present'},
        {date:'2024-10-07',status:'present'},{date:'2024-10-09',status:'absent'},{date:'2024-10-11',status:'present'},
        {date:'2024-10-14',status:'late'},{date:'2024-10-16',status:'present'},{date:'2024-10-18',status:'present'},
        {date:'2024-10-21',status:'present'},{date:'2024-10-23',status:'present'},{date:'2024-10-25',status:'absent'},
        {date:'2024-10-28',status:'present'},{date:'2024-10-30',status:'present'},{date:'2024-11-01',status:'present'},
        {date:'2024-11-04',status:'present'},{date:'2024-11-06',status:'late'},{date:'2024-11-08',status:'present'},
        {date:'2024-11-11',status:'present'},{date:'2024-11-13',status:'present'},{date:'2024-11-15',status:'present'},
      ],
      'u3': [
        {date:'2024-10-01',status:'present'},{date:'2024-10-02',status:'absent'},{date:'2024-10-04',status:'present'},
        {date:'2024-10-07',status:'present'},{date:'2024-10-09',status:'present'},{date:'2024-10-11',status:'late'},
        {date:'2024-10-14',status:'present'},{date:'2024-10-16',status:'present'},{date:'2024-10-18',status:'absent'},
        {date:'2024-10-21',status:'present'},{date:'2024-10-23',status:'present'},{date:'2024-10-25',status:'present'},
        {date:'2024-10-28',status:'present'},{date:'2024-10-30',status:'late'},{date:'2024-11-01',status:'present'},
        {date:'2024-11-04',status:'present'},{date:'2024-11-06',status:'present'},{date:'2024-11-08',status:'absent'},
        {date:'2024-11-11',status:'present'},{date:'2024-11-13',status:'present'},{date:'2024-11-15',status:'present'},
      ]
    },
    'c2': {
      'u2': [
        {date:'2024-10-01',status:'present'},{date:'2024-10-03',status:'present'},{date:'2024-10-08',status:'present'},
        {date:'2024-10-10',status:'late'},{date:'2024-10-15',status:'present'},{date:'2024-10-17',status:'absent'},
        {date:'2024-10-22',status:'present'},{date:'2024-10-24',status:'present'},{date:'2024-10-29',status:'present'},
        {date:'2024-10-31',status:'present'},{date:'2024-11-05',status:'present'},{date:'2024-11-07',status:'present'},
        {date:'2024-11-12',status:'absent'},{date:'2024-11-14',status:'present'},
      ]
    },
    'c3': {
      'u2': [
        {date:'2024-10-01',status:'present'},{date:'2024-10-03',status:'present'},{date:'2024-10-08',status:'absent'},
        {date:'2024-10-10',status:'present'},{date:'2024-10-15',status:'present'},{date:'2024-10-17',status:'present'},
        {date:'2024-10-22',status:'late'},{date:'2024-10-24',status:'present'},{date:'2024-10-29',status:'present'},
        {date:'2024-10-31',status:'present'},{date:'2024-11-05',status:'present'},{date:'2024-11-07',status:'present'},
      ]
    },
    'c4': {
      'u2': [
        {date:'2024-10-09',status:'present'},{date:'2024-10-11',status:'present'},{date:'2024-10-16',status:'present'},
        {date:'2024-10-18',status:'late'},{date:'2024-10-23',status:'present'},{date:'2024-10-25',status:'present'},
        {date:'2024-10-30',status:'absent'},{date:'2024-11-01',status:'present'},{date:'2024-11-06',status:'present'},
        {date:'2024-11-08',status:'present'},
      ]
    }
  },

  /* ─── NOTIFICATIONS ─── */
  notifications: [
    { id:'n1', text:'New assignment posted: Binary Search Tree Implementation', time:'2h ago', read:false, type:'assignment' },
    { id:'n2', text:'Your Sorting Analysis submission has been graded (36/40)', time:'1d ago', read:false, type:'grade' },
    { id:'n3', text:'New announcement in DS&A: Mid-Semester Exam Schedule', time:'2d ago', read:false, type:'announcement' },
    { id:'n4', text:'Guest lecture on AI in Healthcare – Nov 18th', time:'3d ago', read:true, type:'event' },
    { id:'n5', text:'Lab session rescheduled for DBMS – Nov 14th', time:'4d ago', read:true, type:'info' },
  ],

  /* ─── HELPER METHODS ─── */
  load() {
    const saved = localStorage.getItem('cs_data');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      ['users', 'courses', 'assignments', 'submissions', 'announcements', 'notifications'].forEach(key => {
        if (Array.isArray(data[key])) this[key] = data[key];
      });
      if (data.attendance && typeof data.attendance === 'object') this.attendance = data.attendance;
    } catch (error) {
      console.error('Unable to load saved ClassSphere data.', error);
    }
  },
  save() {
    const data = {
      users: this.users,
      courses: this.courses,
      assignments: this.assignments,
      submissions: this.submissions,
      announcements: this.announcements,
      notifications: this.notifications,
      attendance: this.attendance
    };
    localStorage.setItem('cs_data', JSON.stringify(data));
  },
  getUserById(id)     { return this.users.find(u => u.id === id); },
  getCourseById(id)   { return this.courses.find(c => c.id === id); },
  getAssignmentById(id){ return this.assignments.find(a => a.id === id); },

  getCoursesForStudent(uid) {
    return this.courses.filter(c => c.enrolledStudents.includes(uid));
  },
  getCoursesForTeacher(uid) {
    return this.courses.filter(c => c.teacherId === uid);
  },
  getAssignmentsForCourse(cid) {
    return this.assignments.filter(a => a.courseId === cid);
  },
  getSubmissionsForStudent(uid) {
    return this.submissions.filter(s => s.studentId === uid);
  },
  getSubmissionsForAssignment(aid) {
    return this.submissions.filter(s => s.assignmentId === aid);
  },
  getAnnouncementsForCourse(cid) {
    return this.announcements.filter(a => a.courseId === cid);
  },
  getUnreadAnnouncementsForUser(userId) {
    const user = this.getUserById(userId);
    if (!user) return [];
    const courses = user.role === 'teacher'
      ? this.getCoursesForTeacher(userId)
      : this.getCoursesForStudent(userId);
    const courseIds = new Set(courses.map(course => course.id));
    return this.announcements.filter(announcement =>
      courseIds.has(announcement.courseId) &&
      !(announcement.readBy || []).includes(userId)
    );
  },
  markAnnouncementsReadForUser(userId) {
    const unread = this.getUnreadAnnouncementsForUser(userId);
    if (!unread.length) return;
    unread.forEach(announcement => {
      announcement.readBy = [...(announcement.readBy || []), userId];
    });
    this.save();
  },
  getAttendanceForStudent(courseId, studentId) {
    return (this.attendance[courseId] || {})[studentId] || [];
  },
  calcAttendancePct(records) {
    if (!records.length) return 0;
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((present / records.length) * 100);
  },
  addUser(user) {
    this.users.push(user);
    try {
      this.save();
    } catch (error) {
      this.users.pop();
      throw error;
    }
    return user;
  },
  addCourse(course) {
    course.id = 'c' + (Date.now());
    this.courses.push(course);
    this.save();
    return course;
  },
  addAssignment(assignment) {
    assignment.id = 'a' + Date.now();
    this.assignments.push(assignment);
    this.save();
    return assignment;
  },
  addAnnouncement(ann) {
    ann.id = 'an' + Date.now();
    this.announcements.push(ann);
    this.save();
    return ann;
  },
  enrollStudent(courseId, studentId) {
    const course = this.getCourseById(courseId);
    if (course && !course.enrolledStudents.includes(studentId)) {
      course.enrolledStudents.push(studentId);
      this.save();
      return true;
    }
    return false;
  },
  submitAssignment(assignmentId, studentId, content, fileName) {
    const existing = this.submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
    if (existing) {
      existing.content = content;
      existing.fileName = fileName;
      existing.submittedAt = new Date().toISOString();
      this.save();
      return existing;
    }
    const sub = { id:'s'+Date.now(), assignmentId, studentId, submittedAt:new Date().toISOString(), content, fileName, marks:null, feedback:'', status:'submitted' };
    this.submissions.push(sub);
    this.save();
    return sub;
  },
  gradeSubmission(submissionId, marks, feedback) {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (sub) {
      sub.marks = marks;
      sub.feedback = feedback;
      sub.status = 'graded';
      this.save();
      return sub;
    }
    return null;
  },
  markAttendance(courseId, studentId, date, status) {
    if (!this.attendance[courseId]) this.attendance[courseId] = {};
    if (!this.attendance[courseId][studentId]) this.attendance[courseId][studentId] = [];
    const records = this.attendance[courseId][studentId];
    const existing = records.find(r => r.date === date);
    if (existing) { existing.status = status; }
    else { records.push({ date, status }); records.sort((a,b)=>a.date.localeCompare(b.date)); }
    this.save();
  }
};

DB.load();
