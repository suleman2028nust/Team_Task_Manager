import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import api from './api/axios';

// ProtectedRoute guards pages that require authentication
function ProtectedRoute({ children }) {
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setStatus(res.data.loggedIn ? 'ok' : 'denied'))
            .catch(() => setStatus('denied'));
    }, []);

    if (status === 'checking') {
        return (
            <div style={{
                position: 'fixed', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: '#020209', flexDirection: 'column', gap: 12
            }}>
                <div style={{
                    width: 38, height: 38,
                    border: '2px solid #4f46e5',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Checking session…</p>
            </div>
        );
    }

    if (status === 'denied') return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login"    element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;