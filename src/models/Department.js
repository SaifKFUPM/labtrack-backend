const mongoose = require('mongoose');

const policiesSchema = new mongoose.Schema(
  {
    latePenaltyPercent: { type: Number, default: 0 },
    defaultDeadlineTime: { type: String, default: '23:59' },
    requireCodeComments: { type: Boolean, default: false },
    allowPeerCollaboration: { type: Boolean, default: false },
    maxGroupSize: { type: Number, default: 1 },
    plagiarismThreshold: { type: Number, default: 80 },
  },
  { _id: false }
);

const departmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    headId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String, trim: true },
    policies: { type: policiesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
