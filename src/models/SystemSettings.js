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
    _singleton: { type: String, default: 'global', unique: true },

    execution: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        compilationTimeoutSec: 30,
        executionTimeoutSec: 10,
        memoryLimitMB: 256,
        maxOutputKB: 512,
        sandboxEnabled: true,
      },
    },

    languages: {
      type: mongoose.Schema.Types.Mixed,
      default: [
        { id: 'python',     label: 'Python 3.11',           icon: '🐍', enabled: true  },
        { id: 'cpp',        label: 'C++ 17',                icon: '⚙️', enabled: true  },
        { id: 'java',       label: 'Java 21',               icon: '☕', enabled: true  },
        { id: 'javascript', label: 'JavaScript (Node 20)',  icon: '🟨', enabled: true  },
        { id: 'c',          label: 'C 11',                  icon: '🔵', enabled: false },
        { id: 'rust',       label: 'Rust 1.75',             icon: '🦀', enabled: false },
        { id: 'go',         label: 'Go 1.22',               icon: '🐹', enabled: false },
        { id: 'r',          label: 'R 4.3',                 icon: '📊', enabled: false },
      ],
    },

    api: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        judgeApiUrl: '',
        judgeApiKey: '',
        aiAssistApiKey: '',
        aiAssistEnabled: true,
        aiAssistModel: 'gpt-4o',
      },
    },

    testing: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        defaultTestCaseTimeout: 5,
        maxTestCasesPerLab: 50,
        allowCustomTestCases: true,
        showTestOutputToStudent: true,
        partialCreditEnabled: true,
        autoGradeOnSubmit: true,
      },
    },

    notifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        emailNotificationsEnabled: true,
        submissionAlerts: true,
        gradePublishedAlerts: true,
        systemAlerts: true,
        digestFrequency: 'daily',
      },
    },

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
          duration: String,
        },
      ],
    },

    backupSchedule: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        dayOfWeek: 'sunday',
        dayOfMonth: 1,
        scope: 'full',
        retentionDays: 30,
        destination: 'local',
        s3Bucket: 'labtrack-backups',
        notifyOnFailure: true,
        notifyOnSuccess: false,
      },
    },

    backups: [backupRecordSchema],

    security: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        twoFactorRequired: { admin: true, instructor: false, student: false },
        sessionTimeoutMin: { admin: 30, instructor: 120, student: 240 },
        maxLoginAttempts: 5,
        lockoutDurationMin: 15,
        passwordExpiryDays: 90,
        requireStrongPassword: true,
        examMode: {
          enabled: false,
          allowedIpRanges: ['10.0.0.0/24', '192.168.1.0/24'],
          blockVPN: true,
          lockBrowser: false,
        },
      },
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

systemSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ _singleton: 'global' });
  if (!doc) doc = await this.create({ _singleton: 'global' });
  return doc;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
