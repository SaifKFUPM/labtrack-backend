const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

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

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
