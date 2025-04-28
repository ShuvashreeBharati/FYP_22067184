const db = require('../config/db');

// Fetch all feedbacks
const getFeedbacks = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fb.*, u.name 
       FROM feedback fb
       JOIN users u ON fb.user_id = u.user_id
       ORDER BY fb.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server error fetching feedbacks' });
  }
};

// Submit feedback
const submitFeedback = async (req, res) => {
  const { user_id, comment, rating } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO feedback (user_id, comment, rating, created_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [user_id, comment, rating]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
};

module.exports = {
  getFeedbacks,
  submitFeedback
};
