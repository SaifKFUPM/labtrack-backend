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
  clearSystemLogs,
  getMaintenance,
  updateMaintenance,
  getBackups,
  triggerBackup,
  getBackupSchedule,
  updateBackupSchedule,
  getSystemSettings,
  updateSystemSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getAuditLogs,
  clearAuditLogs,
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
router.delete('/system/logs', clearSystemLogs);

// Maintenance
router.get('/system/maintenance', getMaintenance);
router.patch('/system/maintenance', updateMaintenance);

// Backups
router.get('/system/backups', getBackups);
router.post('/system/backups/trigger', triggerBackup);

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

module.exports = router;
