require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user:   process.env.DB_USER,
  host:   process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port:   process.env.DB_PORT,
});

// Health check
app.get('/health', (req, res) => res.send({ status: 'OK' }));

// Test DB connection
app.get('/db-test', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.send({ dbTime: rows[0].now });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server up on port ${PORT}`));
