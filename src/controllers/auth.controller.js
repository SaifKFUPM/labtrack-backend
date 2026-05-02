const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { hasSmtpConfig, sendPasswordResetEmail } = require('../services/email.service');

const RESET_TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30);
const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const requireEmailDelivery = () => (
  process.env.NODE_ENV === 'production' ||
  String(process.env.REQUIRE_EMAIL_DELIVERY || '').toLowerCase() === 'true'
);

const buildResetUrl = (token) => {
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  return `${frontendUrl}/reset-password/${token}`;
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, department, studentId } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ fullName, email: normalizedEmail, password, role, department, studentId });

  res.status(201).json({
    success: true,
    token: generateToken(user),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      status: user.status,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.active || user.status !== 'active') {
    res.status(403);
    throw new Error('Account is deactivated');
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    token: generateToken(user),
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      status: user.status,
    },
  });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email || req.body.identifier);
  if (!/@kfupm\.edu\.sa$/.test(email)) {
    res.status(400);
    throw new Error('Enter a valid KFUPM email');
  }

  if (requireEmailDelivery() && !hasSmtpConfig()) {
    res.status(503);
    throw new Error('Password reset email is not configured');
  }

  const user = await User.findOne({ email });
  if (user && user.active && user.status === 'active') {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetUrl = buildResetUrl(resetToken);
    user.passwordResetToken = hashResetToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.fullName,
        resetUrl,
      });
    } catch (error) {
      if (requireEmailDelivery()) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500);
        throw new Error('Failed to send password reset email');
      }

      console.warn(`Password reset email failed in development. Use this reset link: ${resetUrl}`);
    }
  }

  res.json({
    success: true,
    message: 'If an active account exists for that email, a reset link has been sent.',
  });
});

// POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const password = req.body.password || req.body.newPassword;

  if (!isStrongPassword(password)) {
    res.status(400);
    throw new Error('Password must be at least 8 characters and include uppercase, lowercase, and a number');
  }

  const user = await User.findOne({
    passwordResetToken: hashResetToken(token),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Password reset link is invalid or expired');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password has been reset. You can now sign in.',
  });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: user.studentId,
      status: user.status,
    },
  });
});

module.exports = { register, login, forgotPassword, resetPassword, getMe };
