const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/admin.controller');

router.use(authMiddleware, checkRole('admin'));

// User Management
router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

module.exports = router;
