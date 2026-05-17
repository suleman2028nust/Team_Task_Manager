require('dotenv').config();
const { neonConfig, Pool } = require('@neondatabase/serverless');
const ws = require('ws');
const bcrypt = require('bcrypt');

neonConfig.webSocketConstructor = ws;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL + '?sslmode=require&channel_binding=require'
});

async function seed() {
    try {
        console.log('🌱 Seeding Neon database...\n');

        // ── Create users ──────────────────────────────────────────────
        const password = 'password123'; // same password for all test users
        const hash = await bcrypt.hash(password, 10);

        const users = [
            { username: 'Ali',   email: 'ali@taskflow.com' },
            { username: 'Usman', email: 'usman@taskflow.com' },
            { username: 'Ahmad', email: 'ahmad@taskflow.com' },
        ];

        const createdUsers = [];
        for (const u of users) {
            const res = await pool.query(
                `INSERT INTO users (username, email, password_hash)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
                 RETURNING id, username, email`,
                [u.username, u.email, hash]
            );
            createdUsers.push(res.rows[0]);
            console.log(`✅ User created: ${res.rows[0].username} (id=${res.rows[0].id})`);
        }

        const [ali, usman, ahmad] = createdUsers;

        // ── Create teams ──────────────────────────────────────────────
        const teamRes = await pool.query(
            `INSERT INTO teams (name, description, created_by)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING
             RETURNING id, name`,
            ['Dev Squad', 'Frontend and backend development team', ali.id]
        );
        const team = teamRes.rows[0];
        if (!team) {
            // team might already exist — fetch it
            const existing = await pool.query(`SELECT id, name FROM teams WHERE created_by = $1 LIMIT 1`, [ali.id]);
            if (existing.rows.length) {
                console.log(`ℹ️  Team already exists: ${existing.rows[0].name}`);
            }
        } else {
            console.log(`\n✅ Team created: "${team.name}" (id=${team.id}), Leader: Ali`);
        }

        const teamId = team?.id || (await pool.query(`SELECT id FROM teams WHERE created_by = $1 LIMIT 1`, [ali.id])).rows[0]?.id;

        // ── Add members to team ───────────────────────────────────────
        for (const u of [ali, usman, ahmad]) {
            await pool.query(
                `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [teamId, u.id]
            );
        }
        console.log(`✅ Members added to team: Ali (leader), Usman, Ahmad`);

        // ── Create tasks ──────────────────────────────────────────────
        const tasks = [
            { title: 'Design Login Page',      description: 'Create UI mockup for login and register pages', status: 'completed',   priority: 'high',   assigned_to: usman.id },
            { title: 'Setup Express Server',   description: 'Initialize Node.js + Express backend with routes', status: 'completed',   priority: 'urgent', assigned_to: ali.id },
            { title: 'Implement Auth API',     description: 'Build /auth/register and /auth/login endpoints',  status: 'in_progress', priority: 'high',   assigned_to: ali.id },
            { title: 'Build Dashboard UI',     description: 'React dashboard with task list and stats cards',  status: 'in_progress', priority: 'medium', assigned_to: usman.id },
            { title: 'Write API Docs',         description: 'Document all REST endpoints with examples',       status: 'pending',     priority: 'low',    assigned_to: ahmad.id },
            { title: 'Setup PostgreSQL Schema',description: 'Create tables: users, teams, tasks, sessions',   status: 'completed',   priority: 'urgent', assigned_to: ahmad.id },
        ];

        for (const t of tasks) {
            await pool.query(
                `INSERT INTO tasks (title, description, status, priority, team_id, assigned_to, created_by)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
                [t.title, t.description, t.status, t.priority, teamId, t.assigned_to, ali.id]
            );
            console.log(`✅ Task: "${t.title}" → assigned to ${createdUsers.find(u=>u.id===t.assigned_to)?.username} [${t.status}]`);
        }

        console.log('\n🎉 Seed complete!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Login credentials (all use password: password123)');
        console.log('  Ali   → ali@taskflow.com   (Team Leader)');
        console.log('  Usman → usman@taskflow.com (Member)');
        console.log('  Ahmad → ahmad@taskflow.com (Member)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await pool.end();
    }
}

seed();
