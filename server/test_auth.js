require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

(async () => {
    try {
        // Test 1: fetch Suleman user
        const r = await pool.query('SELECT id, username, password_hash FROM users WHERE id = $1', [1]);
        if (!r.rows.length) {
            console.log('❌ USER NOT FOUND (id=1)');
            return;
        }
        const user = r.rows[0];
        console.log('✅ User found:', user.username, '| Hash prefix:', user.password_hash.substring(0, 10));

        // Test 2: check password123
        const match1 = await bcrypt.compare('password123', user.password_hash);
        console.log('🔑 password123 match:', match1);

        // Test 3: list all users
        const all = await pool.query('SELECT id, username, email FROM users ORDER BY id');
        console.log('👥 All users:', JSON.stringify(all.rows));

        // Test 4: test the dashboard function
        const dash = await pool.query('SELECT get_dashboard_overview($1) AS data', [1]);
        console.log('📊 Dashboard function output:', JSON.stringify(dash.rows[0].data));

    } catch (err) {
        console.error('❌ Error:', err.message, '| Code:', err.code);
    } finally {
        await pool.end();
    }
})();
