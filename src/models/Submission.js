const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  description: { type: String },
  input: { type: String },
  passed: { type: Boolean },
  actualOutput: { type: String },
  expectedOutput: { type: String },
  points: { type: Number },
  visible: { type: Boolean },
});

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['draft', 'submitted', 'graded'], default: 'draft' },
    score: { type: Number, default: 0 },
    rubric: {
      comments: { type: Number, default: 0 },
      style: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
    },
    maxScore: { type: Number, default: 0 },
    overallFeedback: { type: String, default: '' },
    testResults: [testResultSchema],
    late: { type: Boolean, default: false },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
