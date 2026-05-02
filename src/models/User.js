const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const extractStudentIdFromEmail = (email) => {
  const match = String(email || '').trim().toLowerCase().match(/^s(\d+)@kfupm\.edu\.sa$/);
  return match ? match[1] : '';
};

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/@kfupm\.edu\.sa$/, 'Email must be a KFUPM email (@kfupm.edu.sa)'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('validate', function () {
  if (this.role !== 'student') return;
  const extractedStudentId = extractStudentIdFromEmail(this.email);
  if (extractedStudentId) this.studentId = extractedStudentId;
});

// hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// method to compare passwords at login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.statics.extractStudentIdFromEmail = extractStudentIdFromEmail;

module.exports = mongoose.model('User', userSchema);
