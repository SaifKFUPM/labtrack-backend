const mongoose = require('mongoose');

const backupRecordSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String, default: 'manual' },
    scope: { type: String, default: 'full' },
    size: { type: String, default: '0 MB' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    retention: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const systemSettingsSchema = new mongoose.Schema(
  {
    // singleton guard
    _singleton: { type: String, default: 'global', unique: true },

    execution: {
      compilationTimeoutSec: { type: Number, default: 30 },
      executionTimeoutSec: { type: Number, default: 10 },
      memoryLimitMB: { type: Number, default: 256 },
    },
    languages: { type: [String], default: ['python', 'javascript', 'java', 'c', 'cpp'] },
    api: {
      judgeApiUrl: { type: String, default: '' },
      judgeApiKey: { type: String, default: '' },
    },
    testing: { type: mongoose.Schema.Types.Mixed, default: {} },
    notifications: { type: mongoose.Schema.Types.Mixed, default: {} },

    maintenance: {
      active: { type: Boolean, default: false },
      message: { type: String, default: '' },
      scheduledStart: { type: Date },
      scheduledEnd: { type: Date },
      allowAdminAccess: { type: Boolean, default: true },
      history: [
        {
          active: Boolean,
          message: String,
          start: Date,
          end: Date,
        },
      ],
    },

    backupSchedule: {
      enabled: { type: Boolean, default: false },
      frequency: { type: String, default: 'daily' },
      time: { type: String, default: '02:00' },
      retentionDays: { type: Number, default: 30 },
    },

    backups: [backupRecordSchema],

    security: {
      twoFactorRequired: { type: Boolean, default: false },
      sessionTimeoutMin: { type: Number, default: 60 },
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMin: { type: Number, default: 15 },
      passwordExpiryDays: { type: Number, default: 90 },
      requireStrongPassword: { type: Boolean, default: true },
      examMode: { type: Boolean, default: false },
    },

    analyticsReports: [
      {
        name: { type: String },
        type: { type: String },
        filters: { type: mongoose.Schema.Types.Mixed, default: {} },
        generatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// helper to get or create the singleton document
systemSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: 'global' });
  if (!doc) doc = await this.create({ _singleton: 'global' });
  return doc;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
