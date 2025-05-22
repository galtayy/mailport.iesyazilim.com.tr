const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/change-password', authenticateToken, authController.changePassword);
router.post('/users', authenticateToken, requireRole(['admin']), authController.createUser);
router.get('/users', authenticateToken, requireRole(['admin']), authController.getUsers);
router.put('/users/:id', authenticateToken, requireRole(['admin']), authController.updateUser);
router.delete('/users/:id', authenticateToken, requireRole(['admin']), authController.deleteUser);

module.exports = router;