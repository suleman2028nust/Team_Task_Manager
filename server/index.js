const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const pool = require('./db');
require('dotenv').config();

// passport config has to be required after pool is ready
require('./config/passport')(passport);

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow the react frontend to talk to us
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// log database info to verify connection and tables
pool.query('SELECT current_database()', (err, res) => {
    if (!err) {
        console.log(`Connected to database: ${res.rows[0].current_database}`);
        
        // Let's see what tables actually exist
        pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", (err, res) => {
            if (!err) {
                const tables = res.rows.map(r => r.table_name);
                console.log('Available tables in DB:', tables.join(', '));
            }
        });
    }
});

// session stored in postgres
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        schemaName: 'public' // explicitly set the schema
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        httpOnly: true
    }
}));

// passport needs to come after session
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Team Task Manager API running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
