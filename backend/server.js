require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) return console.error('Database connection error:', err.stack);
  console.log('Connected to the database successfully!');
  release();
});

const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title,
             amount::float AS amount,
             category,
             TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

app.get('/api/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(404).json({ message: 'Invalid ID' });

  try {
    const result = await pool.query(`
      SELECT id, title,
             amount::float AS amount,
             category,
             TO_CHAR(date, 'YYYY-MM-DD') AS date
      FROM expenses WHERE id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Expense not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || !title.trim())
    return res.status(400).json({ message: 'Title is required' });
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  if (!category || !ALLOWED_CATEGORIES.includes(category))
    return res.status(400).json({ message: 'Invalid category' });
  if (!date)
    return res.status(400).json({ message: 'Date is required' });

  try {
    const result = await pool.query(`
      INSERT INTO expenses (title, amount, category, date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, amount::float AS amount, category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date
    `, [title.trim(), amount, category, date]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add expense' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(404).json({ message: 'Invalid ID' });

  const { title, amount, category, date } = req.body;

  if (!title || !title.trim())
    return res.status(400).json({ message: 'Title is required' });
  if (!amount || isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  if (!category || !ALLOWED_CATEGORIES.includes(category))
    return res.status(400).json({ message: 'Invalid category' });
  if (!date)
    return res.status(400).json({ message: 'Date is required' });

  try {
    const result = await pool.query(`
      UPDATE expenses
      SET title=$1, amount=$2, category=$3, date=$4
      WHERE id=$5
      RETURNING id, title, amount::float AS amount, category,
                TO_CHAR(date, 'YYYY-MM-DD') AS date
    `, [title.trim(), amount, category, date, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Expense not found' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(404).json({ message: 'Invalid ID' });

  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id=$1 RETURNING id', [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Expense not found' });

    res.json({ message: 'Expense deleted successfully', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));