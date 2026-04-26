const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['draft', 'submitted', 'graded'], default: 'draft' },
    testScore: { type: Number, default: 0 },
    manualScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
