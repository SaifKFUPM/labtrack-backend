const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getProgress, updateProgress } = require('../controllers/student.controller');

router.use(authMiddleware, checkRole('student'));

router.get('/', getProgress);
router.patch('/:labId', updateProgress);

module.exports = router;
