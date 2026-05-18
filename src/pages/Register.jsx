import React, { useState } from 'react';
import { LayoutDashboard, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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

    // Shared input style
    const inputStyle = {
        width: '100%',
        height: '48px',
        background: '#0f0f1a',
        border: '1px solid #1e1e2e',
        borderRadius: '14px',
        paddingLeft: '48px',
        paddingRight: '16px',
        fontSize: '14px',
        color: '#fff',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#020209',
            padding: '20px',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
        }}>
            {/* Background glows */}
            <div style={{
                position: 'absolute', width: '40vw', height: '40vw',
                borderRadius: '50%', filter: 'blur(80px)', zIndex: 0,
                bottom: '-10%', left: '-10%',
                background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
            }} />
            <div style={{
                position: 'absolute', width: '40vw', height: '40vw',
                borderRadius: '50%', filter: 'blur(80px)', zIndex: 0,
                top: '-10%', right: '-10%',
                background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
            }} />

            {/* Card */}
            <div style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: '440px',
                background: '#07070f',
                border: '1px solid #1e1e2e',
                borderRadius: '24px',
                padding: '40px 32px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                boxSizing: 'border-box',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        background: '#4f46e5',
                        borderRadius: '16px',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '20px',
                        boxShadow: '0 10px 25px rgba(79,70,229,0.4)',
                    }}>
                        <LayoutDashboard size={28} color="white" />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
                        Create Account
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                        Join the team management platform
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '12px', padding: '10px 14px',
                        color: '#f87171', fontSize: '13px', textAlign: 'center',
                        marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block', fontSize: '11px', fontWeight: 700,
                            color: '#475569', marginBottom: '8px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Username
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User
                                size={18}
                                style={{
                                    position: 'absolute', left: '15px',
                                    top: '50%', transform: 'translateY(-50%)',
                                    color: '#334155', pointerEvents: 'none', zIndex: 1,
                                }}
                            />
                            <input
                                type="text"
                                style={inputStyle}
                                placeholder="Pick a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#4f46e5'; }}
                                onBlur={e => { e.target.style.borderColor = '#1e1e2e'; }}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block', fontSize: '11px', fontWeight: 700,
                            color: '#475569', marginBottom: '8px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                style={{
                                    position: 'absolute', left: '15px',
                                    top: '50%', transform: 'translateY(-50%)',
                                    color: '#334155', pointerEvents: 'none', zIndex: 1,
                                }}
                            />
                            <input
                                type="email"
                                style={inputStyle}
                                placeholder="work@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#4f46e5'; }}
                                onBlur={e => { e.target.style.borderColor = '#1e1e2e'; }}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block', fontSize: '11px', fontWeight: 700,
                            color: '#475569', marginBottom: '8px',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                style={{
                                    position: 'absolute', left: '15px',
                                    top: '50%', transform: 'translateY(-50%)',
                                    color: '#334155', pointerEvents: 'none', zIndex: 1,
                                }}
                            />
                            <input
                                type="password"
                                style={inputStyle}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={e => { e.target.style.borderColor = '#4f46e5'; }}
                                onBlur={e => { e.target.style.borderColor = '#1e1e2e'; }}
                                required
                            />
                        </div>
                    </div>

                    {/* Security badge */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px',
                        background: 'rgba(16,185,129,0.05)',
                        borderRadius: '8px',
                        marginTop: '16px', marginBottom: '8px',
                    }}>
                        <ShieldCheck size={14} color="#10b981" />
                        <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>
                            Secure bcrypt hashing enabled
                        </span>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', height: '48px',
                            background: loading ? '#3730a3' : '#4f46e5',
                            color: '#fff', border: 'none',
                            borderRadius: '14px', fontSize: '14px', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: '8px',
                            boxShadow: '0 10px 15px -3px rgba(79,70,229,0.3)',
                            transition: 'background 0.2s',
                            opacity: loading ? 0.7 : 1,
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#4338ca'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#4f46e5'; }}
                    >
                        {loading ? 'Creating account...' : (<>Get Started <ArrowRight size={18} /></>)}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <p style={{ color: '#475569', fontSize: '14px', margin: 0 }}>
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
