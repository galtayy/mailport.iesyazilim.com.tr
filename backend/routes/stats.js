const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/emails', statsController.getEmailStats);
router.get('/actions', statsController.getActionStats);
router.get('/system', statsController.getSystemStats);

module.exports = router;