const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    restoredFrom: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Version', versionSchema);
