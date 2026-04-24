import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import pool from './config/db.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);

// Test DB Connection and Start Server
pool.getConnection()
  .then((conn) => {
    console.log('Connected to MySQL Database.');
    conn.release();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MySQL database:', err.message);
    // Don't kill server so the frontend can still show connection error messages
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database Offline)`);
    });
  });
