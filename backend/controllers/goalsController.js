import pool from '../config/db.js';

export const getGoals = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, target, saved, deadline, icon, color FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createGoal = async (req, res) => {
  const { name, target, deadline, icon, color } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO goals (user_id, name, target, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, name, target, deadline || null, icon || '🎯', color || '#0A84FF']
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      target,
      saved: 0,
      deadline,
      icon,
      color
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateGoalSaved = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  try {
    await pool.execute(
      'UPDATE goals SET saved = saved + ? WHERE id = ? AND user_id = ?',
      [amount, id, req.user.id]
    );

    // return the updated row
    const [rows] = await pool.execute('SELECT * FROM goals WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
