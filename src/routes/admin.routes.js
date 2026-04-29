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

module.exports = router;
