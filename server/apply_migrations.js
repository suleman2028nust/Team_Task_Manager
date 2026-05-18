const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables with absolute path
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = require('./db');

async function applyMigrations() {
    const migrationPath = path.join(__dirname, 'migrations.sql');
    console.log(`Reading SQL migrations from: ${migrationPath}`);
    
    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Connecting to database and applying schema optimizations...');
        
        await pool.query(sql);
        
        console.log('SUCCESS: All SQL functions, triggers, and procedures applied perfectly!');
    } catch (err) {
        console.error('ERROR applying migrations:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        console.log('Database pool connection closed.');
    }
}

applyMigrations();
