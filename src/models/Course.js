const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionNumber: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  capacity: { type: Number, default: 50 },
  meetingDays: [{ type: String }],
  startTime: { type: String },
  endTime: { type: String },
  meetingTimes: { type: String },
});

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    semester: { type: String, required: true },
    creditHours: { type: Number, default: 3 },
    sections: [sectionSchema],
    active: { type: Boolean, default: true },
    joinCode: { type: String, unique: true, sparse: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
