const { Pool: PgPool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
    // Use the Neon serverless driver for cloud connections
    // (standard pg@8 is incompatible with Neon's channel_binding=require)
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

// ensure we are always looking in the public schema
pool.on('connect', (client) => {
    client.query('SET search_path TO public');
});

// handle pool errors gracefully
pool.on('error', (err) => {
    console.error('Unexpected pool error:', err.message);
});

// test the connection
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
