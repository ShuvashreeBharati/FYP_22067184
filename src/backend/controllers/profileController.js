const pool = require('../config/db');

module.exports = {
  // =============================
  // Fetch User Profile
  // =============================
  getProfile: async (req, res) => {
    const { userId } = req.params;
    try {
      const { rows } = await pool.query(
        'SELECT user_id, name, email, created_at, profile_picture FROM users WHERE user_id = $1',
        [userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  // =============================
  // Update Name and Email
  // =============================
  updateProfile: async (req, res) => {
    const { userId } = req.params;
    const { name, email } = req.body;
    try {
      const { rowCount } = await pool.query(
        'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE user_id = $3',
        [name, email, userId]
      );
      if (rowCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Profile updated successfully', name, email });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};
