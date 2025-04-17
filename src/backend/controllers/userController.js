// src/backend/controllers/userController.js

const db = require('../config/db'); // Assuming you're using a pool for database connections

// Controller function to get user details
const getUserDetails = (req, res) => {
  const userId = req.params.id; // Extract the user ID from the request parameters
  
  // Query to fetch user from DB by user_id
  db.query('SELECT * FROM users WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user data' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]); // Return the first user row
  });
};

// Controller function to get user diagnosis history
const getUserDiagnosisHistory = (req, res) => {
  const userId = req.params.id; // Extract the user ID from the request parameters
  
  // Query to fetch diagnosis history from DB for the given user_id
  db.query('SELECT * FROM diagnosis WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching diagnosis history' });
    }
    res.json(result.rows); // Return all rows for this user’s diagnosis history
  });
};

module.exports = { getUserDetails, getUserDiagnosisHistory };
