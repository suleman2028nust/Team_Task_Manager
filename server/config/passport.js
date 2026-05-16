const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pool = require('../db');

// this file tells passport how to verify a user during login
module.exports = (passport) => {

    // LocalStrategy looks for username + password in the request body
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE username = $1',
                [username]
            );

            if (result.rows.length === 0) {
                return done(null, false, { message: 'No user found with that username' });
            }

            const user = result.rows[0];
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);

        } catch (err) {
            return done(err);
        }
    }));

    // save user id in session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // get full user object from the id stored in session
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
            done(null, result.rows[0]);
        } catch (err) {
            done(err);
        }
    });
};
