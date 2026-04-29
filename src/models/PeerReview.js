const mongoose = require('mongoose');

const PeerReviewSchema = new mongoose.Schema({
  labId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lab', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['assigned','submitted','closed'], default: 'assigned' },
  fileContents: { type: String },
  files: [{ filename: String, url: String }],
  readability: { type: Number },
  efficiency: { type: Number },
  comments: { type: String },
  strengths: { type: String },
  improvements: { type: String },
  overallComment: { type: String },
  lineComments: [{ line: Number, comment: String }],
  submittedAt: { type: Date },
  shareLink: { type: String },
  dueDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('PeerReview', PeerReviewSchema);
