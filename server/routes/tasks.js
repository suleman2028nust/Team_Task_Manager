const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

const taskSchema = Joi.object({
    title:       Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional().allow(''),
    team_id:     Joi.number().required(),
    assigned_to: Joi.number().optional().allow(null),
    status:      Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    priority:    Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    due_date:    Joi.date().optional().allow(null)
});

// GET /api/tasks - only tasks assigned to the logged-in user (personal task list)
router.get('/', isAuthenticated, async (req, res) => {
    try {
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
                COALESCE(tm.name, 'General') AS team_name,
                COALESCE(u.username, 'Unassigned') AS assignee_name
            FROM tasks t
            LEFT JOIN teams tm ON t.team_id = tm.id
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.assigned_to = $1
            ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /tasks error:', err.message);
        res.status(500).json({ message: 'Could not fetch tasks', error: err.message });
    }
});

// POST /api/tasks - create a new task (Only team leader can create/assign)
router.post('/', isAuthenticated, async (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, description, team_id, assigned_to, status, priority, due_date } = req.body;
    try {
        // Check if user is leader of the team
        const team = await pool.query('SELECT created_by FROM teams WHERE id = $1', [team_id]);
        if (team.rows.length === 0) return res.status(404).json({ message: 'Team not found' });
        if (team.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ message: 'Only the team leader can create and assign tasks' });
        }

        const result = await pool.query(
            `INSERT INTO tasks (title, description, team_id, assigned_to, status, priority, due_date, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [title, description || null, team_id, assigned_to || null, status || 'pending', priority || 'medium', due_date || null, req.user.id]
        );
        res.status(201).json({ message: 'Task created', task: result.rows[0] });
    } catch (err) {
        console.error('POST /tasks error:', err.message);
        res.status(500).json({ message: 'Could not create task' });
    }
});

// PUT /api/tasks/:id - update a task (Leader can edit all, Assignee can only update status)
router.put('/:id', isAuthenticated, async (req, res) => {
    const updateSchema = Joi.object({
        title: Joi.string().min(2).max(200),
        description: Joi.string().max(1000).allow(''),
        team_id: Joi.number(),
        assigned_to: Joi.number().allow(null),
        status: Joi.string().valid('pending', 'in_progress', 'completed'),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
        due_date: Joi.date().allow(null)
    });

    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, description, team_id, assigned_to, status, priority, due_date } = req.body;
    const taskId = req.params.id;

    try {
        // Get task and team info
        const taskRes = await pool.query(
            `SELECT t.*, tm.created_by AS leader_id 
             FROM tasks t 
             JOIN teams tm ON t.team_id = tm.id 
             WHERE t.id = $1`, [taskId]
        );
        if (taskRes.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        
        const task = taskRes.rows[0];
        const isLeader = task.leader_id === req.user.id;
        const isAssignee = task.assigned_to === req.user.id;

        if (!isLeader && !isAssignee) {
            return res.status(403).json({ message: 'You do not have permission to update this task' });
        }

        // If not leader (only assignee), restrict updates to 'status' only
        if (!isLeader) {
            const updates = Object.keys(req.body);
            if (updates.length > 1 || updates[0] !== 'status') {
                return res.status(403).json({ message: 'Team members can only update task status' });
            }
        }

        const result = await pool.query(
            `UPDATE tasks
             SET
                title       = COALESCE($1, title),
                description = COALESCE($2, description),
                team_id     = COALESCE($3, team_id),
                assigned_to = CASE WHEN $4 = 'KEEP_CURRENT' THEN assigned_to ELSE $5 END,
                status      = COALESCE($6, status),
                priority    = COALESCE($7, priority),
                due_date    = CASE WHEN $8 = 'KEEP_CURRENT' THEN due_date ELSE $9 END
             WHERE id = $10
             RETURNING *`,
            [
                isLeader ? (title || null) : task.title,
                isLeader ? (description || null) : task.description,
                isLeader ? (team_id || null) : task.team_id,
                isLeader ? (assigned_to === undefined ? 'KEEP_CURRENT' : 'CHANGE') : 'KEEP_CURRENT',
                isLeader ? assigned_to : null,
                status || null, // both can update status
                isLeader ? (priority || null) : task.priority,
                isLeader ? (due_date === undefined ? 'KEEP_CURRENT' : 'CHANGE') : 'KEEP_CURRENT',
                isLeader ? due_date : null,
                taskId
            ]
        );
        res.json({ message: 'Task updated', task: result.rows[0] });
    } catch (err) {
        console.error('PUT /tasks/:id error:', err.message);
        res.status(500).json({ message: 'Could not update task' });
    }
});

// DELETE /api/tasks/:id - delete a task (Only team leader can delete)
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const taskRes = await pool.query(
            `SELECT tm.created_by AS leader_id 
             FROM tasks t 
             JOIN teams tm ON t.team_id = tm.id 
             WHERE t.id = $1`, [req.params.id]
        );
        if (taskRes.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        
        if (taskRes.rows[0].leader_id !== req.user.id) {
            return res.status(403).json({ message: 'Only the team leader can delete tasks' });
        }

        await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error('DELETE /tasks/:id error:', err.message);
        res.status(500).json({ message: 'Could not delete task' });
    }
});

module.exports = router;
