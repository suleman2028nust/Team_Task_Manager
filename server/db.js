const { Pool } = require('pg');
require('dotenv').config();

// just a simple pg pool, nothing fancy
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ensure we are always looking in the public schema
pool.on('connect', (client) => {
    client.query('SET search_path TO public');
});

// test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
    } else {
        console.log(`Connected to PostgreSQL database: ${process.env.DB_NAME}`);
        release();
    }
});

module.exports = pool;
