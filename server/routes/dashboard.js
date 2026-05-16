const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    try {
        const [statsResult, recentResult, teamsResult] = await Promise.all([

            // 1. Task counts
            pool.query(
                `SELECT
                    COUNT(*)                                        AS total,
                    COUNT(*) FILTER (WHERE status = 'pending')     AS pending,
                    COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
                    COUNT(*) FILTER (WHERE status = 'completed')   AS completed
                 FROM tasks
                 WHERE created_by = $1 OR assigned_to = $1`,
                [userId]
            ),

            // 2. 5 most recent tasks
            pool.query(
                `SELECT
                    t.id,
                    t.title,
                    t.status,
                    t.priority,
                    t.due_date,
                    tm.name       AS team_name,
                    u.username    AS assignee_name
                 FROM tasks t
                 LEFT JOIN teams tm ON t.team_id    = tm.id
                 LEFT JOIN users u  ON t.assigned_to = u.id
                 WHERE t.created_by = $1 OR t.assigned_to = $1
                 ORDER BY t.created_at DESC
                 LIMIT 5`,
                [userId]
            ),

            // 3. Team count
            pool.query(
                `SELECT COUNT(*) AS count
                 FROM team_members
                 WHERE user_id = $1`,
                [userId]
            )
        ]);

        res.json({
            stats: {
                total:       parseInt(statsResult.rows[0].total)       || 0,
                pending:     parseInt(statsResult.rows[0].pending)     || 0,
                in_progress: parseInt(statsResult.rows[0].in_progress) || 0,
                completed:   parseInt(statsResult.rows[0].completed)   || 0,
                teams:       parseInt(teamsResult.rows[0].count)       || 0,
            },
            recent_tasks: recentResult.rows
        });

    } catch (err) {
        console.error('GET /dashboard error:', err.message);
        res.status(500).json({ message: 'Could not load dashboard', error: err.message });
    }
});

module.exports = router;
