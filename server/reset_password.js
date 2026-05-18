require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcrypt');

// Reset password for a specific user — change these values as needed
const TARGET_USERNAME = 'Suleman';
const NEW_PASSWORD = 'password123';

(async () => {
    try {
        const hash = await bcrypt.hash(NEW_PASSWORD, 10);
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING id, username, email',
            [hash, TARGET_USERNAME]
        );

        if (result.rows.length === 0) {
            console.log(`❌ No user found with username: ${TARGET_USERNAME}`);
        } else {
            console.log(`✅ Password reset successfully for:`, result.rows[0]);
            console.log(`   New password is: "${NEW_PASSWORD}"`);
        }
    } catch (err) {
        console.error('❌ Reset failed:', err.message);
    } finally {
        await pool.end();
    }
})();
