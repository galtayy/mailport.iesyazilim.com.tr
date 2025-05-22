const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no auth needed)
router.get('/attachments/:attachmentId/view', emailController.viewAttachment);

// Protected routes (auth needed)
router.use(authenticateToken);

router.get('/', emailController.getAllEmails);
router.get('/stats', emailController.getStats);
router.get('/:id', emailController.getEmailById);
router.get('/:id/history', emailController.getEmailHistory);
router.put('/:id', emailController.updateEmail);
router.post('/:id/forward', emailController.forwardEmail);
router.post('/:id/reply', emailController.replyEmail);
router.get('/attachments/:attachmentId/download', emailController.downloadAttachment);

module.exports = router;