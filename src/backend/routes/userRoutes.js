const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  getUserDetails, 
  getUserHistory 
} = require('../controllers/userController'); // Proper destructuring

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
router.get('/userHistory', authenticateToken, getUserHistory);
router.get('/:id', authenticateToken, getUserDetails);

module.exports = router;
