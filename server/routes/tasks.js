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

// GET /api/tasks - all tasks for this user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.due_date,
                t.created_at,
                t.assigned_to,
                COALESCE(tm.name, 'General')      AS team_name,
                COALESCE(u.username, 'Unassigned') AS assignee_name
             FROM tasks t
             LEFT JOIN teams  tm ON t.team_id    = tm.id
             LEFT JOIN users  u  ON t.assigned_to = u.id
             WHERE t.created_by = $1 OR t.assigned_to = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('GET /tasks error:', err.message);
        res.status(500).json({ message: 'Could not fetch tasks', error: err.message });
    }
});

// POST /api/tasks - create a new task
router.post('/', isAuthenticated, async (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { title, description, team_id, assigned_to, status, priority, due_date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO tasks (title, description, team_id, assigned_to, status, priority, due_date, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title,
                description || null,
                team_id,
                assigned_to || null,
                status   || 'pending',
                priority || 'medium',
                due_date || null,
                req.user.id
            ]
        );
        res.status(201).json({ message: 'Task created', task: result.rows[0] });
    } catch (err) {
        console.error('POST /tasks error:', err.message);
        res.status(500).json({ message: 'Could not create task', error: err.message });
    }
});

// PUT /api/tasks/:id - update a task
router.put('/:id', isAuthenticated, async (req, res) => {
    const { title, description, assigned_to, status, priority, due_date } = req.body;
    const taskId = req.params.id;
    try {
        const result = await pool.query(
            `UPDATE tasks
             SET
                title       = COALESCE($1, title),
                description = COALESCE($2, description),
                assigned_to = $3,
                status      = COALESCE($4, status),
                priority    = COALESCE($5, priority),
                due_date    = $6
             WHERE id = $7
             RETURNING *`,
            [title, description, assigned_to || null, status, priority, due_date || null, taskId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task updated', task: result.rows[0] });
    } catch (err) {
        console.error('PUT /tasks/:id error:', err.message);
        res.status(500).json({ message: 'Could not update task', error: err.message });
    }
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND created_by = $2 RETURNING id',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        console.error('DELETE /tasks/:id error:', err.message);
        res.status(500).json({ message: 'Could not delete task', error: err.message });
    }
});

module.exports = router;
