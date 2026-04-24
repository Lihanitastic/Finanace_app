import pool from '../config/db.js';

export const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, type, amount, category, note, is_one_off as isOneOff, date FROM transactions WHERE user_id = ? ORDER BY date DESC',
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  const { type, amount, category, note, isOneOff, date } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO transactions (user_id, type, amount, category, note, is_one_off, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, type, amount, category, note, isOneOff ? 1 : 0, date || new Date()]
    );
    
    res.status(201).json({
      id: result.insertId,
      type,
      amount,
      category,
      note,
      isOneOff,
      date: date || new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
