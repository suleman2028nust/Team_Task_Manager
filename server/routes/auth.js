const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const Joi = require('joi');
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');


// validation schemas using Joi
const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    // validate the request body first
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password } = req.body;

    try {
        // check if username or email is already taken
        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Username or email is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // log them in automatically after registering
        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Registered but could not log in automatically' });
            }
            res.status(201).json({
                message: 'Account created!',
                user: newUser
            });
        });

    } catch (err) {
        console.error('Register error:', err.message);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// POST /api/auth/login
router.post('/login', (req, res, next) => {
    // validate inputs
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // passport handles the actual authentication
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            return res.status(401).json({ message: info.message || 'Invalid credentials' });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            res.json({
                message: 'Logged in successfully',
                user: { id: user.id, username: user.username, email: user.email }
            });
        });

    })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out' });
    });
});

// GET /api/auth/me - check who is currently logged in
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ loggedIn: true, user: req.user });
    } else {
        res.json({ loggedIn: false });
    }
});

// GET /api/auth/users/search - find users by username or email
router.get('/users/search', isAuthenticated, async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    try {
        const result = await pool.query(
            `SELECT id, username, email 
             FROM users 
             WHERE (username ILIKE $1 OR email ILIKE $1) 
             AND id != $2
             LIMIT 10`,
            [`%${q}%`, req.user?.id || -1]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('User search error:', err.message);
        res.status(500).json({ message: 'Error searching users' });
    }
});

module.exports = router;
