const { Pool: PgPool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
    // Neon cloud driver
    const { Pool: NeonPool, neonConfig } = require('@neondatabase/serverless');
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;

    pool = new NeonPool({
        connectionString: process.env.DATABASE_URL + '?sslmode=require&channel_binding=require',
    });
    console.log('Connecting to Neon PostgreSQL (serverless driver)...');
} else {
    pool = new PgPool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT) || 5432,
    });
}

// Set schema search path
pool.on('connect', (client) => {
    client.query('SET search_path TO public');
});

pool.on('error', (err) => {
    console.error('Unexpected pool error:', err.message);
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log(process.env.DATABASE_URL
            ? 'Successfully connected to Neon PostgreSQL!'
            : `Connected to local PostgreSQL: ${process.env.DB_NAME}`);
        release();
    }
});

module.exports = pool;
