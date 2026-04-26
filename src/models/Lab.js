const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    instructions: { type: String, required: true },
    dueDate: { type: Date, required: true },
    totalPoints: { type: Number, required: true, min: 1, max: 200 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    allowedLanguages: [{ type: String }],
    starterCode: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'active', 'closed'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lab', labSchema);
