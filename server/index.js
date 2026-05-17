require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const pool = require('./db');
const path = require('path');

// passport config has to be required after pool is ready
require('./config/passport')(passport);

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 8080;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow the react frontend to talk to us (for local dev)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Serve static files from React build directory
app.use(express.static(path.join(__dirname, 'public')));

// session stored in postgres
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        schemaName: 'public'
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
app.use('/api/dashboard', dashboardRoutes);

// Fallback to React index.html for Single Page Application routing (React Router)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
