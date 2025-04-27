const axios = require('axios'); 
const db = require('../config/db'); 
const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

const getUserDetails = (req, res) => {
  const userId = req.params.id; 
  
  db.query('SELECT * FROM users WHERE user_id = $1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user data' });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  });
};

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


module.exports = { getUserDetails, getUserHistory };
