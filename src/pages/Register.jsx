import React, { useState } from 'react';
import { LayoutDashboard, Lock, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

/* ── Design System ── */
const S = {
    page: {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020209',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
        padding: 20
    },
    glow: {
        position: 'absolute',
        width: '40vw',
        height: '40vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
    },
    card: {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: 440,
        background: '#07070f',
        border: '1px solid #1e1e2e',
        borderRadius: 24,
        padding: '40px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    inputWrapper: {
        position: 'relative',
        marginBottom: 16
    },
    input: {
        width: '100%',
        background: '#0f0f1a',
        border: '1px solid #1e1e2e',
        borderRadius: 14,
        padding: '14px 14px 14px 44px',
        fontSize: 14,
        color: 'white',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontFamily: 'inherit',
        boxSizing: 'border-box'
    },
    label: {
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    icon: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#334155',
        pointerEvents: 'none'
    },
    btn: {
        width: '100%',
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: 14,
        padding: '14px',
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
        marginTop: 10
    },
    error: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        padding: '12px',
        color: '#f87171',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 24
    },
    secureBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        background: 'rgba(16, 185, 129, 0.05)',
        borderRadius: 8,
        marginTop: 16,
        marginBottom: 8
    }
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/register', { username, email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={S.page}>
            {/* Animated Background Glows */}
            <div style={{ ...S.glow, bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)' }}></div>
            <div style={{ ...S.glow, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)' }}></div>

            <div style={S.card}>
                {/* Logo Section */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ 
                        width: 56, height: 56, background: '#4f46e5', borderRadius: 16, 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20, boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
                    }}>
                        <LayoutDashboard size={28} color="white" />
                    </div>
                    <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>Join the team management platform</p>
                </div>

                {error && <div style={S.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={S.inputWrapper}>
                        <label style={S.label}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User style={S.icon} size={18} />
                            <input
                                type="text"
                                style={S.input}
                                placeholder="Pick a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4f46e5';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#1e1e2e';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={S.inputWrapper}>
                        <label style={S.label}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={S.icon} size={18} />
                            <input
                                type="email"
                                style={S.input}
                                placeholder="work@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4f46e5';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#1e1e2e';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={S.inputWrapper}>
                        <label style={S.label}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={S.icon} size={18} />
                            <input
                                type="password"
                                style={S.input}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#4f46e5';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#1e1e2e';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div style={S.secureBadge}>
                        <ShieldCheck size={14} color="#10b981" />
                        <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600 }}>Secure bcrypt hashing enabled</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
                        onMouseEnter={(e) => e.target.style.background = '#4338ca'}
                        onMouseLeave={(e) => e.target.style.background = '#4f46e5'}
                    >
                        {loading ? 'Creating account...' : (<>Get Started <ArrowRight size={18} /></>)}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <p style={{ color: '#475569', fontSize: 14 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
