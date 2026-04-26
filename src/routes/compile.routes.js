const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { runCode } = require('../controllers/compile.controller');

router.use(authMiddleware);
router.post('/', runCode);

module.exports = router;
