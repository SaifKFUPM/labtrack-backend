const { runTests } = require('../services/testRunner.service');
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
  getCourses,
  getLabs,
  getLabById,
  submitLab,
  getGrades,
  saveVersion,
  getVersions,
} = require('../controllers/student.controller');

router.use(authMiddleware);
router.use(checkRole('student'));

router.get('/courses', getCourses);
router.get('/courses/:courseId/labs', getLabs);
router.get('/labs/:labId', getLabById);
router.post('/submit', submitLab);
router.get('/grades', getGrades);
router.post('/versions', saveVersion);
router.get('/versions/:labId', getVersions);

module.exports = router;
