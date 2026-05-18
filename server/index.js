require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const pool = require('./db');
const path = require('path');

// Passport configuration
require('./config/passport')(passport);

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filepath) => {
        if (path.extname(filepath) === '.html') {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        }
    }
}));

// Session configuration
let sessionStore;
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
    sessionStore = new pgSession({
        pool: pool,
        tableName: 'session',
        schemaName: 'public'
    });
    console.log('Session store: PostgreSQL (connect-pg-simple)');
} else {
    sessionStore = new session.MemoryStore();
    console.log('Session store: MemoryStore (Dev Fallback)');
}

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev_session_secret_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Protected routes
const protectedRoutes = ['/dashboard'];
app.use((req, res, next) => {
    const isProtected = protectedRoutes.some(r => req.path === r || req.path.startsWith(r + '/'));
    if (isProtected && !req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
});

// SPA routing fallback
app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
