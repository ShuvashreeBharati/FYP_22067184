const axios = require('axios');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

// =============================
// Get User Details
// =============================
const getUserDetails = async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT user_id, name, email, created_at, profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // No need to modify profile_picture — frontend will handle full URL construction
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// =============================
// Change User Password
// =============================
const updateUserPassword = async (req, res) => {
  const { userId } = req.params;
  const { current_password, new_password } = req.body;

  try {
    const { rows } = await db.query(
      'SELECT password FROM users WHERE user_id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(current_password, rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await db.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE user_id = $2',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// =============================
// Upload Profile Picture
// =============================
const uploadProfilePicture = async (req, res) => {
  const { userId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const profilePicturePath = `/uploads/${req.file.filename}`;

  try {
    const { rowCount } = await db.query(
      'UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE user_id = $2',
      [profilePicturePath, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile picture updated', 
      profile_picture: profilePicturePath   // return only the relative path
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to update profile picture' });
  }
};

// =============================
// Get User History (from Flask)
// =============================
const getUserHistory = async (req, res) => {
  try {
    const flaskResponse = await axios.get(`${FLASK_API_URL}/history`, {
      params: { user_id: req.user.userId }
    });

    const data = flaskResponse.data;
    console.log('Flask /history response:', data);

    if (!data.success) {
      return res.status(400).json({ message: data.error || 'Failed to get history' });
    }

    res.json(data.history);
  } catch (error) {
    console.error('Error fetching user history:', error.message);
    res.status(500).json({ message: 'Failed to fetch user history' });
  }
};

// =============================
// Export All
// =============================
module.exports = {
  getUserDetails,
  updateUserPassword,
  uploadProfilePicture,
  getUserHistory
};
