const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/email', settingsController.getEmailSettings);
router.put('/email', requireRole(['admin']), settingsController.updateEmailSettings);
router.get('/system', settingsController.getSystemInfo);
router.post('/test-email', requireRole(['admin']), settingsController.sendTestEmail);
router.post('/cleanup', requireRole(['admin']), settingsController.cleanupDatabase);

module.exports = router;