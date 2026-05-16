const { Pool } = require('pg');
require('dotenv').config();

// If DATABASE_URL is set (production/cloud), use it directly.
// Otherwise fall back to individual vars (local development).
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }   // required by Neon / Cloud SQL
    })
    : new Pool({
        user:     process.env.DB_USER,
        host:     process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port:     parseInt(process.env.DB_PORT) || 5432,
    });

// always look in the public schema
pool.on('connect', client => {
    client.query('SET search_path TO public');
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to PostgreSQL ✓');
        release();
    }
});

module.exports = pool;
