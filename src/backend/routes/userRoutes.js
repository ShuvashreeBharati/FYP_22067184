const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middleware/auth');
const {
  getUserDetails,
  updateUserPassword,
  uploadProfilePicture,
  getUserHistory
} = require('../controllers/userController');

// =============================
// Multer config for uploads
// =============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage });

// =============================
// Test Route (no auth required)
// =============================
router.get('/test', (req, res) => res.json({ message: "Route is working" }));

// =============================
// Protected Routes
// =============================
router.get('/protected-route', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.get('/userHistory', authenticateToken, getUserHistory);

// Get User Details
router.get('/:userId', authenticateToken, getUserDetails);

// Change Password
router.put('/:userId/password', authenticateToken, updateUserPassword);

// Upload/Update Profile Picture
router.put('/:userId/picture', authenticateToken, upload.single('profile_picture'), uploadProfilePicture);

module.exports = router;
