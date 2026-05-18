const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT get_dashboard_overview($1) AS data', [userId]);
        res.json(result.rows[0].data);
    } catch (err) {
        console.error('GET /dashboard error:', err.message);
        res.status(500).json({ message: 'Could not load dashboard', error: err.message });
    }
});

module.exports = router;
