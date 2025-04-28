const express = require('express');
const router = express.Router();
const { getFeedbacks, submitFeedback } = require('../controllers/feedbackController');

// Route to fetch feedbacks
router.get('/fetch-feedback', getFeedbacks);

// Route to submit feedback
router.post('/submit-feedback', submitFeedback);

module.exports = router;
