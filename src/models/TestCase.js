const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
    description: { type: String, required: true },
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    points: { type: Number, required: true, min: 1 },
    visible: { type: Boolean, default: true },
    timeoutSeconds: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCase', testCaseSchema);
