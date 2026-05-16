const express = require('express');
const router = express.Router();
const Joi = require('joi');
const pool = require('../db');
const { isAuthenticated } = require('../middleware/auth');

// validation for creating/updating a task
const taskSchema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional().allow(''),
    team_id: Joi.number().required(),
    assigned_to: Joi.number().optional().allow(null),
    status: Joi.string().valid('pending', 'in_progress', 'completed').optional(),
    due_date: Joi.date().optional().allow(null)
});

// GET /api/tasks - get all tasks for teams the user belongs to
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                t.id,
                t.title,
                t.status,
                t.created_at,
                COALESCE(t.description, '') as description,
                COALESCE(t.priority, 'medium') as priority,
                COALESCE(t.due_date, NULL) as due_date,
                COALESCE(u.username, 'Unassigned') as assignee_name,
                COALESCE(tm.name, 'General') as team_name
             FROM tasks t
             LEFT JOIN teams tm ON t.team_id = tm.id
             LEFT JOIN users u ON t.assigned_to = u.id
             WHERE t.created_by = $1 OR t.assigned_to = $1
             ORDER BY t.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Get tasks error:', err.message);
        res.status(500).json({ 
            message: 'Could not fetch tasks',
            detail: err.message
        });
    }
});

// POST /api/tasks - create a new task
router.post('/', isAuthenticated, async (req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, team_id, assigned_to, status, due_date } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO tasks (title, description, team_id, assigned_to, status, due_date, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, description || null, team_id, assigned_to || null, status || 'pending', due_date || null, req.user.id]
        );

        res.status(201).json({ message: 'Task created', task: result.rows[0] });

    } catch (err) {
        console.error('Create task error:', err.message);
        res.status(500).json({ message: 'Could not create task' });
    }
});

// PUT /api/tasks/:id - update a task
router.put('/:id', isAuthenticated, async (req, res) => {
    const { title, description, assigned_to, status, due_date } = req.body;
    const taskId = req.params.id;

    try {
        const result = await pool.query(
            `UPDATE tasks 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 assigned_to = $3,
                 status = COALESCE($4, status),
                 due_date = $5
             WHERE id = $6 RETURNING *`,
            [title, description, assigned_to || null, status, due_date || null, taskId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task updated', task: result.rows[0] });

    } catch (err) {
        console.error('Update task error:', err.message);
        res.status(500).json({ message: 'Could not update task' });
    }
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 RETURNING id',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({ message: 'Task deleted' });

    } catch (err) {
        console.error('Delete task error:', err.message);
        res.status(500).json({ message: 'Could not delete task' });
    }
});

module.exports = router;
