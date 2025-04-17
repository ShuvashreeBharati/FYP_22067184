const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false,
      error: "Name, email and password are required" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Check if user exists
    const userExists = await client.query(
      "SELECT 1 FROM users WHERE email = $1 FOR UPDATE", 
      [email]
    );
    
    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        success: false,
        error: "Email already in use" 
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 3. Create user
    const now = new Date();
    const newUser = await client.query(
      `INSERT INTO users (name, email, password, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING user_id, name, email`,
      [name, email, hashedPassword, now, now]
    );

    // 4. Generate token WITHOUT expiration
    const user = newUser.rows[0];
    const token = jwt.sign(
      { userId: user.user_id }, // Payload
      process.env.JWT_SECRET    // Secret key
      // No expiresIn option
    );

    await client.query('COMMIT');
    
    res.status(201).json({ 
      success: true,
      user: { 
        userId: user.user_id, 
        name: user.name, 
        email: user.email 
      },
      token 
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Registration error:", error.stack);
    res.status(500).json({ 
      success: false,
      error: "Registration failed" 
    });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const client = await pool.connect();
  
  try {
    // 1. Find user
    const userResult = await client.query(
      "SELECT user_id, name, email, password FROM users WHERE email = $1", 
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
    }

    // 2. Verify password
    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
    }

    // 3. Generate token WITHOUT expiration
    const token = jwt.sign(
      { userId: user.user_id }, // Same payload structure
      process.env.JWT_SECRET
      // No expiresIn option
    );

    res.json({ 
      success: true,
      token,
      user: { 
        userId: user.user_id, 
        name: user.name, 
        email: user.email 
      }
    });

  } catch (error) {
    console.error("Login error:", error.stack);
    res.status(500).json({ 
      success: false,
      error: "Login failed" 
    });
  } finally {
    client.release();
  }
};

module.exports = { register, login };