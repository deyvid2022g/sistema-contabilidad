const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());

// Load MySQL configuration
const configPath = path.join(__dirname, 'src', 'database', 'config.properties');
const configContent = fs.readFileSync(configPath, 'utf8');
const config = {};
configContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    config[key.trim()] = value.trim();
  }
});

// Create MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: config['db.username'],
  password: config['db.password'],
  database: 'sistema_contable',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
const initDatabase = async () => {
  try {
    // Read and execute the MySQL schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.mysql.sql'), 'utf8');
    const connection = await pool.getConnection();
    
    // Split the schema into individual statements
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
    
    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    connection.release();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
};

// Helper functions for database queries
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const queryOne = async (sql, params = []) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows[0];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

const execute = async (sql, params = []) => {
  try {
    const [result] = await pool.query(sql, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
};

// Bills endpoints
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await query('SELECT * FROM bills ORDER BY created_at DESC');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bills', async (req, res) => {
  try {
    const { clientId, billNumber, issueDate, dueDate, totalAmount, status, notes } = req.body;
    const id = uuidv4();
    await execute(
      'INSERT INTO bills (id, client_id, bill_number, issue_date, due_date, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, clientId, billNumber, issueDate, dueDate, totalAmount, status || 'pending', notes]
    );
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clients endpoints
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const id = uuidv4();
    await execute(
      'INSERT INTO clients (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, phone, address]
    );
    res.json({ id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transactions endpoints
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await query('SELECT * FROM transactions ORDER BY date DESC');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accounts endpoints
app.get('/api/accounts', async (req, res) => {
  try {
    const accounts = await query('SELECT * FROM accounts WHERE is_active = TRUE');
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices endpoints
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await query('SELECT * FROM invoices ORDER BY issue_date DESC');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

// Initialize database before starting server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});