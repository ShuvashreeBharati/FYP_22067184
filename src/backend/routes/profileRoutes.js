const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Profile endpoints
router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);
router.put('/:userId/picture', profileController.updateProfilePicture);
router.get('/:userId/history', profileController.getDiagnosisHistory);

module.exports = router;