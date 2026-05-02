const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getDepartments,
  createDepartment,
  updateDepartment,
  getSystemLogs,
  resolveSystemLog,
  deleteSystemLog,
  clearSystemLogs,
  getSystemMetrics,
  getMaintenance,
  updateMaintenance,
  getBackups,
  triggerBackup,
  deleteBackup,
  getBackupSchedule,
  updateBackupSchedule,
  getSystemSettings,
  updateSystemSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getAuditLogs,
  clearAuditLogs,
  getAnalytics,
  createAnalyticsReport,
  getAnalyticsReports,
  deleteAnalyticsReport,
} = require('../controllers/admin.controller');

router.use(authMiddleware, checkRole('admin'));

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Course Management
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.patch('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);

// Departments
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.patch('/departments/:deptId', updateDepartment);

// System Logs
router.get('/system/logs', getSystemLogs);
router.patch('/system/logs/:logId', resolveSystemLog);
router.delete('/system/logs/:logId', deleteSystemLog);
router.delete('/system/logs', clearSystemLogs);
router.get('/system/metrics', getSystemMetrics);

// Maintenance
router.get('/system/maintenance', getMaintenance);
router.patch('/system/maintenance', updateMaintenance);

// Backups
router.get('/system/backups', getBackups);
router.post('/system/backups/trigger', triggerBackup);
router.delete('/system/backups/:backupId', deleteBackup);

// Backup Schedule
router.get('/system/backup-schedule', getBackupSchedule);
router.patch('/system/backup-schedule', updateBackupSchedule);

// System Settings
router.get('/system/settings', getSystemSettings);
router.patch('/system/settings', updateSystemSettings);

// Security Settings
router.get('/security/settings', getSecuritySettings);
router.patch('/security/settings', updateSecuritySettings);

// Audit Logs
router.get('/audit-logs', getAuditLogs);
router.delete('/audit-logs', clearAuditLogs);

// Analytics
router.get('/analytics', getAnalytics);
router.post('/analytics/reports', createAnalyticsReport);
router.get('/analytics/reports', getAnalyticsReports);
router.delete('/analytics/reports/:reportId', deleteAnalyticsReport);

module.exports = router;
