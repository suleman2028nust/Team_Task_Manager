const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// all team routes are protected - user must be logged in
const teamSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(300).optional()
});

// GET /api/teams - get all teams the logged in user belongs to
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.name, t.description, t.created_at, u.username as created_by
             FROM teams t
             JOIN team_members tm ON t.id = tm.team_id
             JOIN users u ON t.created_by = u.id
             WHERE tm.user_id = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get teams error:', err.message);
        res.status(500).json({ message: 'Could not fetch teams' });
    }
});

// POST /api/teams - create a new team
router.post('/', isAuthenticated, async (req, res) => {
    const { error } = teamSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description } = req.body;

    try {
        // create the team
        const teamResult = await pool.query(
            'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, description || null, req.user.id]
        );

        const newTeam = teamResult.rows[0];

        // automatically add creator as a member
        await pool.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)',
            [newTeam.id, req.user.id]
        );

        res.status(201).json({ message: 'Team created', team: newTeam });

    } catch (err) {
        console.error('Create team error:', err.message);
        res.status(500).json({ message: 'Could not create team' });
    }
});

// POST /api/teams/:id/members - add a member to a team
router.post('/:id/members', isAuthenticated, async (req, res) => {
    const teamId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        // check the team exists
        const team = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
        if (team.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }

        await pool.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [teamId, userId]
        );

        res.json({ message: 'Member added to team' });

    } catch (err) {
        console.error('Add member error:', err.message);
        res.status(500).json({ message: 'Could not add member' });
    }
});

// GET /api/teams/:id/members - get all members of a team
router.get('/:id/members', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.username, u.email FROM users u
             JOIN team_members tm ON u.id = tm.user_id
             WHERE tm.team_id = $1`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get members error:', err.message);
        res.status(500).json({ message: 'Could not fetch members' });
    }
});

module.exports = router;
