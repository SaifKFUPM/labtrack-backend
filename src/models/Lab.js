const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  points: { type: Number, required: true, min: 1 },
  visible: { type: Boolean, default: true },
  timeoutSeconds: { type: Number, default: 5 },
});

const solutionSchema = new mongoose.Schema({
  language: { type: String, required: true },
  code: { type: String, required: true },
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
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testCases: [testCaseSchema],
    solutions: [solutionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
