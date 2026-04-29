const User = require('../models/User');
const Course = require('../models/Course');
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

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
