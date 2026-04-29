const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  status: { type: String, enum: ['not started','in progress','submitted','graded'], default: 'not started' },
  code: { type: String },
  submittedAt: { type: Date },
  score: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);
