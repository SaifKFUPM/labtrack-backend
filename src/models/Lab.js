const mongoose = require('mongoose');

const labFileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    size: { type: Number, default: 0 },
    fileType: { type: String, default: '' },
    content: { type: String, default: '' },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, required: true },
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  points: { type: Number, required: true, min: 1 },
  visible: { type: Boolean, default: true },
  timeoutSeconds: { type: Number, default: 5 },
  order: { type: Number },
  verified: { type: Boolean, default: false },
});

const solutionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['instructor', 'top_student'],
    default: 'instructor',
  },
  title: { type: String, default: 'Reference Solution' },
  language: { type: String, required: true },
  code: { type: String, default: '' },
  files: { type: mongoose.Schema.Types.Mixed, default: {} },
  explanation: { type: String, default: '' },
  unlockedAt: { type: Date },
  publishedAt: { type: Date },
  releaseMode: { type: String, default: 'after_graded' },
  status: { type: String, default: 'scheduled' },
});

const labSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    labNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date, required: true },
    points: { type: Number, required: true, min: 1, max: 200 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    languages: [{ type: String }],
    starterCode: { type: String, default: '' },
    files: [{ type: String, trim: true }],
    starterFiles: [labFileSchema],
    supportingFiles: [labFileSchema],
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testCases: [testCaseSchema],
    solutions: [solutionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
