import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Simple regex for email validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const registerUser = async (req, res) => {
  const { email, password, name, focus, employmentType } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists (Parameterized query)
    const [existing] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert user (Parameterized query)
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name, focus, employment_type) VALUES (?, ?, ?, ?, ?)',
      [email, hash, name, focus || 'track', employmentType || 'salaried']
    );

    const userId = result.insertId;

    // create token
    const token = createToken(userId);

    res.status(200).json({ email, name, token, focus, employmentType: employmentType || 'salaried' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Parametrized query
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Incorrect email' });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // create a token
    const token = createToken(user.id);

    res.status(200).json({ 
      email: user.email, 
      name: user.name, 
      token, 
      focus: user.focus, 
      employmentType: user.employment_type 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, email, name, focus, employment_type as employmentType, created_at as joinedAt FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMe = async (req, res) => {
  const { name, employmentType } = req.body;
  try {
    await pool.execute(
      'UPDATE users SET name = ?, employment_type = ? WHERE id = ?',
      [name, employmentType, req.user.id]
    );
    res.status(200).json({ name, employmentType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
