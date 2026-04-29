const User = require('../models/User');
const Course = require('../models/Course');
const Department = require('../models/Department');
const SystemLog = require('../models/SystemLog');
const SystemSettings = require('../models/SystemSettings');
const asyncHandler = require('../utils/asyncHandler');

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

// DELETE /api/admin/system/logs
const clearSystemLogs = asyncHandler(async (req, res) => {
  await SystemLog.deleteMany({});
  res.json({ success: true, message: 'All logs cleared' });
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
  const { scope } = req.body;
  const settings = await SystemSettings.getSingleton();

  const backup = {
    name: `backup-${Date.now()}`,
    type: 'manual',
    scope: scope || 'full',
    size: '0 MB',
    status: 'completed',
    retention: settings.backupSchedule.retentionDays,
  };

  settings.backups.push(backup);
  settings.markModified('backups');
  await settings.save();

  const saved = settings.backups[settings.backups.length - 1];
  res.status(201).json({ success: true, data: { backupId: saved._id, status: saved.status } });
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
  Object.assign(settings.backupSchedule, req.body);
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

  if (execution !== undefined) {
    Object.assign(settings.execution, execution);
    settings.markModified('execution');
  }
  if (languages !== undefined) settings.languages = languages;
  if (api !== undefined) {
    Object.assign(settings.api, api);
    settings.markModified('api');
  }
  if (testing !== undefined) settings.testing = { ...settings.testing, ...testing };
  if (notifications !== undefined) settings.notifications = { ...settings.notifications, ...notifications };

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
  clearSystemLogs,
  getMaintenance,
  updateMaintenance,
  getBackups,
  triggerBackup,
  getBackupSchedule,
  updateBackupSchedule,
  getSystemSettings,
  updateSystemSettings,
};
