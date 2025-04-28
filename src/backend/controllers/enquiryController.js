const pool = require('../config/db'); // your db connection

// Controller to handle sending enquiries
exports.sendEnquiry = async (req, res) => {
  try {
    const { user_id, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required.' });
    }

    const createdAt = new Date();

    await pool.query(
      'INSERT INTO enquiry (user_id, subject, message, created_at) VALUES ($1, $2, $3, $4)',
      [user_id, subject, message, createdAt]
    );

    res.status(201).json({ message: 'Enquiry submitted successfully.' });
  } catch (error) {
    console.error('Error sending enquiry:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
