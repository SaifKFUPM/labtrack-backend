const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const { getLabs, createLab, updateLab, deleteLab, publishLab } = require('../controllers/instructor.controller');

router.use(authMiddleware);
router.use(checkRole('instructor'));

router.get('/labs', getLabs);
router.post('/labs', createLab);
router.patch('/labs/:labId', updateLab);
router.delete('/labs/:labId', deleteLab);
router.patch('/labs/:labId/publish', publishLab);

module.exports = router;
