const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// Profile Endpoints
router.get('/:userId', authenticateToken, profileController.getProfile);
router.put('/:userId', authenticateToken, profileController.updateProfile);

module.exports = router;
