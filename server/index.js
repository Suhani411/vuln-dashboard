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

const fs = require('fs');
const path = require('path');

app.post('/api/mock-scan', async (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-scan.json')));
    for (const vuln of data) {
      await pool.query(
        'INSERT INTO vulnerabilities (scan_id, cve_id, description, severity, cvss_score) VALUES ($1, $2, $3, $4, $5)',
        [1, vuln.cve_id, vuln.description, vuln.severity, vuln.cvss_score]
      );
    }
    res.send({ status: 'Inserted mock data successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Failed to insert mock data' });
  }
});

app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM vulnerabilities ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});