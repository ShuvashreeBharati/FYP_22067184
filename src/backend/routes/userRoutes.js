const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getUserDetails, 
  getUserDiagnosisHistory 
} = require('../controllers/userController'); // Proper destructuring

// history
router.get('/history', authenticateToken, (req, res) => {
    // Redirect to the proper user-specific endpoint
    res.redirect(`/api/users/${req.user.userId}/history`);
  });

// Test route
router.get('/test', (req, res) => {
  res.json({ message: "Route is working" });
});

// Protected routes
router.get('/protected-route', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// User routes with authentication
router.get('/:id', authenticateToken, getUserDetails);
router.get('/:id/history', authenticateToken, getUserDiagnosisHistory);

module.exports = router;