require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static uploads folder
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api', require('./flaskRoutes')(pool));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profileRoutes')); 
app.use('/api/feedback', require('./routes/feedbackRoutes')); 
app.use('/api/enquiry', require('./routes/enquiryRoutes'));

// Check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK',
    routes: {
      diagnose: 'POST /api/diagnose',
      history: 'GET /api/history',
      users: '/api/users',
      auth: '/auth',
      feedback: '/api/feedback',
      enquiry: '/api/enquiry'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Connected to PostgreSQL: ${!!pool}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - POST /api/diagnose`);
  console.log(`   - GET /api/history`);
  console.log(`   - /api/users/*`);
  console.log(`   - /auth/*`);
  console.log(`   - /api/feedback/*`);
  console.log(`   - /api/enquiry/*`);
});
