const express = require("express");
const router = express.Router();
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticateToken } = require('./middleware/auth');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function(pool) {
  const FLASK_API_URL = process.env.FLASK_API_URL || 'http://127.0.0.1:5001';

  // Proxy middleware for Flask API
  router.use(
    '/flask-api',
    createProxyMiddleware({
      target: FLASK_API_URL,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/flask-api': '' },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader('X-Proxy', 'Node-to-Flask');
      }
    })
  );

  // Enhanced JSON validation
  const validateJsonInput = (field) => (req, res, next) => {
    if (!req.body[field]) return next();
    try {
      if (typeof req.body[field] === 'string') {
        req.body[field] = JSON.parse(req.body[field]);
      }
      next();
    } catch (e) {
      res.status(400).json({ 
        error: `Invalid ${field} format`,
        example: { [field]: ["fever", "headache"] }
      });
    }
  };

  router.post("/diagnose", 
    authenticateToken,
    validateJsonInput('symptoms'),
    async (req, res) => {
      const client = await pool.connect();
      try {
        // 1. Process symptoms
        const symptoms = Array.isArray(req.body.symptoms) 
          ? req.body.symptoms 
          : req.body.symptoms.split(',').map(s => s.trim()).filter(Boolean);
  
        // 2. Call Flask API - only get top 3 predictions
        const flaskResponse = await axios.post(`${FLASK_API_URL}/predict`, {
          symptoms: symptoms.join(','),
          user_id: req.user.userId,
          top_n: 3 // Request only top 3 predictions
        });
  
        const mlResponse = flaskResponse.data;
  
        // 3. Begin transaction
        await client.query('BEGIN');
  
        // 4. Save to disease_prediction (ONLY ONCE)
        const predResult = await client.query(
          `INSERT INTO disease_prediction 
          (user_id, predictions, symptoms, created_at) 
          VALUES ($1, $2::jsonb, $3::jsonb, NOW())
          RETURNING prediction_id`,
          [
            req.user.userId, 
            JSON.stringify(mlResponse.predictions.slice(0, 3)), // Ensure only top 3
            JSON.stringify(symptoms)
          ]
        );
  
        // 5. Save to user_history (ONLY ONCE)
        if (mlResponse.predictions?.length) {
          await client.query(
            `INSERT INTO user_history (
              user_id, prediction_id, visited_at, 
              predicted_disease, confidence
            ) VALUES ($1, $2, NOW(), $3, $4)`,
            [
              req.user.userId,
              predResult.rows[0].prediction_id,
              mlResponse.predictions[0].disease_name, // Main predicted disease
              mlResponse.predictions[0].confidence
            ]
          );
        }
  
        await client.query('COMMIT');
  
        res.json({
          success: true,
          predictions: mlResponse.predictions.slice(0, 3) // Return only top 3
        });
  
      } catch (err) {
        await client.query('ROLLBACK');
        console.error("Diagnosis error:", err);
        res.status(500).json({
          success: false,
          error: "Diagnosis failed",
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      } finally {
        client.release();
      }
    }
  );
  
  return router;
};