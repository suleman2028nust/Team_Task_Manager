const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

const teamSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(300).optional().allow('')
});

// Get teams for logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                t.id,
                t.name,
                COALESCE(t.description, '') AS description,
                t.created_by,
                t.created_at
             FROM teams t
             JOIN team_members tm ON t.id = tm.team_id
             WHERE tm.user_id = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /teams error:', err.message);
        res.status(500).json({ message: 'Could not fetch teams', error: err.message });
    }
});

// Create a new team
router.post('/', isAuthenticated, async (req, res) => {
    const { error } = teamSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, description } = req.body;
    try {
        const teamResult = await pool.query(
            'INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, description || null, req.user.id]
        );
        const newTeam = teamResult.rows[0];

        res.status(201).json({ message: 'Team created', team: newTeam });
    } catch (err) {
        console.error('POST /teams error:', err.message);
        res.status(500).json({ message: 'Could not create team', error: err.message });
    }
});

// Add member to team
router.post('/:id/members', isAuthenticated, async (req, res) => {
    const teamId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    try {
        const team = await pool.query('SELECT created_by FROM teams WHERE id = $1', [teamId]);
        if (team.rows.length === 0) return res.status(404).json({ message: 'Team not found' });
        
        if (team.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: 'Only the team leader can add members' });
        }

        await pool.query(
            'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [teamId, userId]
        );
        res.json({ message: 'Member added to team' });
    } catch (err) {
        console.error('POST /teams/:id/members error:', err.message);
        res.status(500).json({ message: 'Could not add member', error: err.message });
    }
});

// Get team members
router.get('/:id/members', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.username, u.email
             FROM users u
             JOIN team_members tm ON u.id = tm.user_id
             WHERE tm.team_id = $1`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /teams/:id/members error:', err.message);
        res.status(500).json({ message: 'Could not fetch members', error: err.message });
    }
});

// Get team tasks
router.get('/:id/tasks', isAuthenticated, async (req, res) => {
    try {
        const membership = await pool.query(
            'SELECT 1 FROM team_members WHERE team_id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (membership.rows.length === 0) {
            return res.status(403).json({ message: 'You are not a member of this team' });
        }

        const result = await pool.query(`
            SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.created_at,
                t.assigned_to,
                t.team_id,
                tm.name AS team_name,
                COALESCE(u.username, 'Unassigned') AS assignee_name
            FROM tasks t
            JOIN teams tm ON t.team_id = tm.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.team_id = $1
            ORDER BY t.created_at DESC`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /teams/:id/tasks error:', err.message);
        res.status(500).json({ message: 'Could not fetch team tasks', error: err.message });
    }
});

// Remove member from team
router.delete('/:id/members/:userId', isAuthenticated, async (req, res) => {
    const { id, userId } = req.params;
    try {
        const team = await pool.query('SELECT created_by FROM teams WHERE id = $1', [id]);
        if (team.rows.length === 0) return res.status(404).json({ message: 'Team not found' });
        
        if (team.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: 'Only the team leader can remove members' });
        }

        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'You cannot remove yourself. Delete the team to dissolve it.' });
        }

        await pool.query('DELETE FROM team_members WHERE team_id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Member removed from team' });
    } catch (err) {
        console.error('REMOVE member error:', err.message);
        res.status(500).json({ message: 'Could not remove member' });
    }
});

// Delete team
router.delete('/:id', isAuthenticated, async (req, res) => {
    const teamId = req.params.id;
    try {
        const team = await pool.query('SELECT created_by FROM teams WHERE id = $1', [teamId]);
        if (team.rows.length === 0) return res.status(404).json({ message: 'Team not found' });
        
        if (team.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: 'Only the team creator can delete this team' });
        }

        await pool.query('DELETE FROM teams WHERE id = $1', [teamId]);
        res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        console.error('DELETE /teams/:id error:', err.message);
        res.status(500).json({ message: 'Could not delete team', error: err.message });
    }
});

module.exports = router;
