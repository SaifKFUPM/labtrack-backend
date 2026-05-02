const User = require('../models/User');
const os = require('os');
const Course = require('../models/Course');
const Department = require('../models/Department');
const Lab = require('../models/Lab');
const Submission = require('../models/Submission');
const SystemLog = require('../models/SystemLog');
const SystemSettings = require('../models/SystemSettings');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const requestMetrics = require('../utils/requestMetrics');

const formatCourse = (c) => ({
  id: c._id,
  courseCode: c.code,
  name: c.name,
  department: c.department,
  creditHours: c.creditHours,
  semester: c.semester,
  sections: (c.sections || []).map((s) => ({
    sectionNumber: s.sectionNumber,
    instructorId: s.instructor,
    enrolledStudentIds: s.students,
    meetingDays: s.meetingTimes,
    capacity: s.capacity,
  })),
  active: c.active,
  createdAt: c.createdAt,
});

// ─── User Management ──────────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  const data = users.map((u) => ({
    id: u._id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    department: u.department,
    studentId: u.studentId,
    status: u.status,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));

  res.json({ success: true, data });
});

// POST /api/admin/users
const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department, studentId } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error('fullName, email, and password are required');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({ fullName, email, password, role, department, studentId });

  res.status(201).json({
    success: true,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

// PATCH /api/admin/users/:userId
const updateUser = asyncHandler(async (req, res) => {
  const { role, department, status } = req.body;

  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (role !== undefined) user.role = role;
  if (department !== undefined) user.department = department;
  if (status !== undefined) user.status = status;

  await user.save();

  res.json({
    success: true,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

// DELETE /api/admin/users/:userId — soft delete
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.status = 'inactive';
  await user.save();

  res.json({ success: true, message: 'User deactivated' });
});

// ─── Course Management ────────────────────────────────────────────────────────

// GET /api/admin/courses
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().sort({ code: 1 });
  res.json({ success: true, data: courses.map(formatCourse) });
});

// POST /api/admin/courses
const createCourse = asyncHandler(async (req, res) => {
  const { courseCode, name, department, creditHours, semester, sections } = req.body;

  if (!courseCode || !name || !department || !semester) {
    res.status(400);
    throw new Error('courseCode, name, department, and semester are required');
  }

  const mappedSections = (sections || []).map((s) => ({
    sectionNumber: s.sectionNumber,
    instructor: s.instructorId,
    students: s.enrolledStudentIds || [],
    capacity: s.capacity,
    meetingTimes: s.meetingDays,
  }));

  const course = await Course.create({
    code: courseCode,
    name,
    department,
    creditHours,
    semester,
    sections: mappedSections,
  });

  res.status(201).json({ success: true, data: formatCourse(course) });
});

// PATCH /api/admin/courses/:courseId
const updateCourse = asyncHandler(async (req, res) => {
  const { courseCode, name, department, creditHours, semester, sections } = req.body;

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (courseCode !== undefined) course.code = courseCode;
  if (name !== undefined) course.name = name;
  if (department !== undefined) course.department = department;
  if (creditHours !== undefined) course.creditHours = creditHours;
  if (semester !== undefined) course.semester = semester;
  if (sections !== undefined) {
    course.sections = sections.map((s) => ({
      sectionNumber: s.sectionNumber,
      instructor: s.instructorId,
      students: s.enrolledStudentIds || [],
      capacity: s.capacity,
      meetingTimes: s.meetingDays,
    }));
  }

  await course.save();
  res.json({ success: true, data: formatCourse(course) });
});

// DELETE /api/admin/courses/:courseId
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, message: 'Course deleted' });
});

// ─── Departments ──────────────────────────────────────────────────────────────

// GET /api/admin/departments
const getDepartments = asyncHandler(async (req, res) => {
  const depts = await Department.find().sort({ code: 1 });
  res.json({ success: true, data: depts });
});

// POST /api/admin/departments
const createDepartment = asyncHandler(async (req, res) => {
  const { code, name, headId, contactEmail, policies } = req.body;

  if (!code || !name) {
    res.status(400);
    throw new Error('code and name are required');
  }

  const exists = await Department.findOne({ code });
  if (exists) {
    res.status(409);
    throw new Error('Department with this code already exists');
  }

  const dept = await Department.create({ code, name, headId, contactEmail, policies });
  res.status(201).json({ success: true, data: dept });
});

// PATCH /api/admin/departments/:deptId
const updateDepartment = asyncHandler(async (req, res) => {
  const { code, name, headId, contactEmail, policies } = req.body;

  const dept = await Department.findById(req.params.deptId);
  if (!dept) {
    res.status(404);
    throw new Error('Department not found');
  }

  if (code !== undefined) dept.code = code;
  if (name !== undefined) dept.name = name;
  if (headId !== undefined) dept.headId = headId;
  if (contactEmail !== undefined) dept.contactEmail = contactEmail;
  if (policies !== undefined) dept.policies = { ...dept.policies.toObject(), ...policies };

  await dept.save();
  res.json({ success: true, data: dept });
});

// ─── System Logs ─────────────────────────────────────────────────────────────

// GET /api/admin/system/logs
const getSystemLogs = asyncHandler(async (req, res) => {
  const logs = await SystemLog.find().sort({ createdAt: -1 });
  const data = logs.map((l) => ({
    id: l._id,
    level: l.level,
    service: l.service,
    message: l.message,
    timestamp: l.createdAt,
    resolved: l.resolved,
  }));
  res.json({ success: true, data });
});

// PATCH /api/admin/system/logs/:logId
const resolveSystemLog = asyncHandler(async (req, res) => {
  const { resolved } = req.body;
  const log = await SystemLog.findById(req.params.logId);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  log.resolved = resolved ?? true;
  await log.save();
  res.json({ success: true, data: { id: log._id, resolved: log.resolved } });
});

// DELETE /api/admin/system/logs/:logId
const deleteSystemLog = asyncHandler(async (req, res) => {
  const log = await SystemLog.findByIdAndDelete(req.params.logId);
  if (!log) {
    res.status(404);
    throw new Error('Log not found');
  }
  res.json({ success: true, message: 'Log deleted' });
});

// DELETE /api/admin/system/logs
const clearSystemLogs = asyncHandler(async (req, res) => {
  await SystemLog.deleteMany({ resolved: true });
  res.json({ success: true, message: 'Resolved logs cleared' });
});

// GET /api/admin/system/metrics
const getSystemMetrics = asyncHandler(async (req, res) => {
  const requestStats = requestMetrics.snapshot();
  const loadAverage = os.loadavg()[0] || 0;
  const cpuCount = os.cpus().length || 1;
  const memoryUsedPct = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
  const activeSince = new Date(Date.now() - 15 * 60 * 1000);

  const [activeSessions, unresolvedLogs] = await Promise.all([
    User.countDocuments({ status: 'active', lastLogin: { $gte: activeSince } }),
    SystemLog.countDocuments({ resolved: false }),
  ]);

  const uptimeSec = Math.floor(process.uptime());
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);

  res.json({
    success: true,
    data: {
      cpu: Math.min(100, Math.round((loadAverage / cpuCount) * 100)),
      memory: memoryUsedPct,
      disk: null,
      activeJobs: 0,
      queuedJobs: 0,
      uptime: `${days}d ${hours}h ${minutes}m`,
      activeSessions,
      unresolvedLogs,
      ...requestStats,
    },
  });
});

// ─── Maintenance ──────────────────────────────────────────────────────────────

// GET /api/admin/system/maintenance
const getMaintenance = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  res.json({ success: true, data: settings.maintenance });
});

// PATCH /api/admin/system/maintenance
const updateMaintenance = asyncHandler(async (req, res) => {
  const { active, message, scheduledStart, scheduledEnd, allowAdminAccess } = req.body;
  const settings = await SystemSettings.getSingleton();

  if (active !== undefined) settings.maintenance.active = active;
  if (message !== undefined) settings.maintenance.message = message;
  if (scheduledStart !== undefined) settings.maintenance.scheduledStart = scheduledStart;
  if (scheduledEnd !== undefined) settings.maintenance.scheduledEnd = scheduledEnd;
  if (allowAdminAccess !== undefined) settings.maintenance.allowAdminAccess = allowAdminAccess;
  if (req.body.history !== undefined) settings.maintenance.history = req.body.history;

  settings.markModified('maintenance');
  await settings.save();
  res.json({ success: true, data: settings.maintenance });
});

// ─── Backups ──────────────────────────────────────────────────────────────────

// GET /api/admin/system/backups
const getBackups = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  const data = (settings.backups || []).map((b) => ({
    id: b._id,
    name: b.name,
    type: b.type,
    scope: b.scope,
    size: b.size,
    status: b.status,
    ts: b.createdAt,
    retention: b.retention,
  }));
  res.json({ success: true, data });
});

// POST /api/admin/system/backups/trigger
const triggerBackup = asyncHandler(async (req, res) => {
  const { name, scope, retention } = req.body;
  const settings = await SystemSettings.getSingleton();

  const backup = {
    name: name || `backup-${Date.now()}`,
    type: 'manual',
    scope: scope || 'full',
    size: '0 MB',
    status: 'completed',
    retention: retention || settings.backupSchedule?.retentionDays || 30,
  };

  settings.backups.push(backup);
  settings.markModified('backups');
  await settings.save();

  const saved = settings.backups[settings.backups.length - 1];
  res.status(201).json({ success: true, data: { id: saved._id, name: saved.name, type: saved.type, scope: saved.scope, size: saved.size, status: saved.status, ts: saved.createdAt, retention: saved.retention } });
});

// DELETE /api/admin/system/backups/:backupId
const deleteBackup = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  const { backupId } = req.params;
  settings.backups = settings.backups.filter((b) => b._id.toString() !== backupId);
  settings.markModified('backups');
  await settings.save();
  res.json({ success: true, message: 'Backup deleted' });
});

// ─── Backup Schedule ──────────────────────────────────────────────────────────

// GET /api/admin/system/backup-schedule
const getBackupSchedule = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  res.json({ success: true, data: settings.backupSchedule });
});

// PATCH /api/admin/system/backup-schedule
const updateBackupSchedule = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  settings.backupSchedule = { ...(settings.backupSchedule || {}), ...req.body };
  settings.markModified('backupSchedule');
  await settings.save();
  res.json({ success: true, data: settings.backupSchedule });
});

// ─── System Settings ──────────────────────────────────────────────────────────

// GET /api/admin/system/settings
const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  res.json({
    success: true,
    data: {
      execution: settings.execution,
      languages: settings.languages,
      api: settings.api,
      testing: settings.testing,
      notifications: settings.notifications,
    },
  });
});

// PATCH /api/admin/system/settings
const updateSystemSettings = asyncHandler(async (req, res) => {
  const { execution, languages, api, testing, notifications } = req.body;
  const settings = await SystemSettings.getSingleton();

  if (execution !== undefined) { settings.execution = execution; settings.markModified('execution'); }
  if (languages !== undefined) { settings.languages = languages; settings.markModified('languages'); }
  if (api !== undefined) { settings.api = api; settings.markModified('api'); }
  if (testing !== undefined) { settings.testing = testing; settings.markModified('testing'); }
  if (notifications !== undefined) { settings.notifications = notifications; settings.markModified('notifications'); }

  await settings.save();
  res.json({
    success: true,
    data: {
      execution: settings.execution,
      languages: settings.languages,
      api: settings.api,
      testing: settings.testing,
      notifications: settings.notifications,
    },
  });
});

// ─── Security Settings ────────────────────────────────────────────────────────

// GET /api/admin/security/settings
const getSecuritySettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  res.json({ success: true, data: settings.security });
});

// PATCH /api/admin/security/settings
const updateSecuritySettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  settings.security = req.body;
  settings.markModified('security');
  await settings.save();
  res.json({ success: true, data: settings.security });
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

// GET /api/admin/audit-logs
const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('actor', 'fullName email')
    .sort({ createdAt: -1 });

  const data = logs.map((l) => ({
    id: l._id,
    actor: l.actor,
    action: l.action,
    target: l.target,
    ip: l.ip,
    ts: l.createdAt,
    severity: l.severity,
  }));

  res.json({ success: true, data });
});

// DELETE /api/admin/audit-logs
const clearAuditLogs = asyncHandler(async (req, res) => {
  await AuditLog.deleteMany({});
  res.json({ success: true, message: 'Audit log cleared' });
});

// ─── Analytics ────────────────────────────────────────────────────────────────

// GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const [users, courses, labs, departments, allSubmissions] = await Promise.all([
    User.find().select('role status lastLogin'),
    Course.find().select('code department sections'),
    Lab.find().select('status courseId'),
    Department.find().select('code name'),
    Submission.find().populate({ path: 'labId', select: 'courseId' }),
  ]);

  const userStats = {
    total: users.length,
    active: users.filter((user) => user.status === 'active').length,
    students: users.filter((user) => user.role === 'student').length,
    instructors: users.filter((user) => user.role === 'instructor').length,
    admins: users.filter((user) => user.role === 'admin').length,
  };

  const courseStats = {
    total: courses.length,
    sections: courses.reduce((sum, course) => sum + (course.sections || []).length, 0),
    enrolled: courses.reduce((sum, course) => (
      sum + (course.sections || []).reduce((sectionSum, section) => sectionSum + (section.students || []).length, 0)
    ), 0),
  };

  const graded = allSubmissions.filter((submission) => submission.status === 'graded' && submission.score != null);
  const labStats = {
    total: labs.filter((lab) => lab.status === 'active').length,
    submissions: allSubmissions.length,
    avgGrade: graded.length
      ? Math.round(graded.reduce((sum, submission) => sum + submission.score, 0) / graded.length)
      : 0,
  };

  // department-level submission counts via courseId -> course.department
  const courseToDept = Object.fromEntries(courses.map((c) => [c._id.toString(), c.department]));
  const deptNames = Object.fromEntries(departments.map((dept) => [dept.code, dept.name]));

  const deptSubMap = {};
  const deptScoreMap = {};
  for (const sub of allSubmissions) {
    const courseId = sub.labId?.courseId?.toString();
    const dept = courseToDept[courseId];
    if (!dept) continue;
    deptSubMap[dept] = (deptSubMap[dept] || 0) + 1;
    if (sub.score != null) {
      if (!deptScoreMap[dept]) deptScoreMap[dept] = [];
      deptScoreMap[dept].push(sub.score);
    }
  }
  const deptSubs = Object.entries(deptSubMap).map(([code, count]) => {
    const scores = deptScoreMap[code] || [];
    return {
      code,
      name: deptNames[code] || code,
      subs: count,
      avgGrade: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    };
  });

  // weekly: submissions per week for the last 8 weeks
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const eightWeeksAgo = new Date(Date.now() - 8 * weekMs);
  const recentSubs = allSubmissions.filter((s) => s.submittedAt >= eightWeeksAgo);
  const weeklyMap = new Map();
  for (const sub of recentSubs) {
    if (!sub.submittedAt) continue;
    const weekStart = new Date(sub.submittedAt);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1);
  }
  const weekly = Array.from(weeklyMap.entries())
    .map(([week, submissions]) => ({ week, submissions }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // language usage
  const langMap = {};
  for (const sub of allSubmissions) {
    if (sub.language) langMap[sub.language] = (langMap[sub.language] || 0) + 1;
  }
  const palette = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#fb923c', '#f87171'];
  const totalLanguageSubmissions = Object.values(langMap).reduce((sum, count) => sum + count, 0) || 1;
  const langs = Object.entries(langMap).map(([lang, count], index) => ({
    lang,
    count,
    pct: Math.round((count / totalLanguageSubmissions) * 100),
    color: palette[index % palette.length],
  }));

  res.json({
    success: true,
    data: {
      stats: { users: userStats, courses: courseStats, labs: labStats },
      deptSubs,
      weekly,
      langs,
    },
  });
});

// POST /api/admin/analytics/reports
const createAnalyticsReport = asyncHandler(async (req, res) => {
  const { name, type, filters } = req.body;
  if (!name || !type) {
    res.status(400);
    throw new Error('name and type are required');
  }

  const settings = await SystemSettings.getSingleton();
  settings.analyticsReports.push({ name, type, filters: filters || {}, generatedAt: new Date() });
  settings.markModified('analyticsReports');
  await settings.save();

  const saved = settings.analyticsReports[settings.analyticsReports.length - 1];
  res.status(201).json({
    success: true,
    data: {
      id: saved._id,
      name: saved.name,
      type: saved.type,
      filters: saved.filters,
      generatedAt: saved.generatedAt,
    },
  });
});

// GET /api/admin/analytics/reports
const getAnalyticsReports = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  const data = (settings.analyticsReports || []).map((r) => ({
    id: r._id,
    name: r.name,
    type: r.type,
    filters: r.filters,
    generatedAt: r.generatedAt,
  }));
  res.json({ success: true, data });
});

// DELETE /api/admin/analytics/reports/:reportId
const deleteAnalyticsReport = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.getSingleton();
  const before = settings.analyticsReports.length;
  settings.analyticsReports = settings.analyticsReports.filter(
    (report) => report._id.toString() !== req.params.reportId,
  );

  if (settings.analyticsReports.length === before) {
    res.status(404);
    throw new Error('Report not found');
  }

  settings.markModified('analyticsReports');
  await settings.save();
  res.json({ success: true, message: 'Report deleted' });
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getDepartments,
  createDepartment,
  updateDepartment,
  getSystemLogs,
  resolveSystemLog,
  deleteSystemLog,
  clearSystemLogs,
  getSystemMetrics,
  getMaintenance,
  updateMaintenance,
  getBackups,
  triggerBackup,
  deleteBackup,
  getBackupSchedule,
  updateBackupSchedule,
  getSystemSettings,
  updateSystemSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getAuditLogs,
  clearAuditLogs,
  getAnalytics,
  createAnalyticsReport,
  getAnalyticsReports,
  deleteAnalyticsReport,
};
