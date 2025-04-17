require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Import pool here

const app = express();
const PORT = process.env.PORT || 3500;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./flaskRoutes')(pool)); // Pass pool to flaskRoutes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK',
    routes: {
      diagnose: 'POST /api/diagnose',
      history: 'GET /api/history',
      users: '/api/users',
      auth: '/auth'
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
});