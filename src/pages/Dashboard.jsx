import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, CheckSquare, Users, LogOut,
    Plus, Search, Bell, ChevronRight, Clock,
    AlertCircle, CheckCircle2, Circle, TrendingUp, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const statusConfig = {
    completed:   { label: 'Completed',   textColor: 'text-emerald-400', bg: 'bg-emerald-400/10', bar: 'bg-emerald-400', Icon: CheckCircle2 },
    in_progress: { label: 'In Progress', textColor: 'text-indigo-400',  bg: 'bg-indigo-400/10',  bar: 'bg-indigo-500',  Icon: Clock },
    pending:     { label: 'Pending',     textColor: 'text-amber-400',   bg: 'bg-amber-400/10',   bar: 'bg-amber-400',   Icon: Circle },
};

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeNav, setActiveNav] = useState('tasks');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const meRes = await api.get('/auth/me');
                if (!meRes.data.loggedIn) { navigate('/login'); return; }
                setUser(meRes.data.user);
                const tasksRes = await api.get('/tasks');
                setTasks(tasksRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [navigate]);

    const handleLogout = async () => {
        await api.post('/auth/logout');
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ position: 'fixed', inset: 0, background: '#020209', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, border: '2px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
                    <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>Loading workspace...</p>
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Tasks',  value: tasks.length,                                         Icon: BarChart3,      accent: '#6366f1' },
        { label: 'In Progress',  value: tasks.filter(t => t.status === 'in_progress').length,  Icon: TrendingUp,     accent: '#3b82f6' },
        { label: 'Completed',    value: tasks.filter(t => t.status === 'completed').length,    Icon: CheckCircle2,   accent: '#10b981' },
        { label: 'Pending',      value: tasks.filter(t => t.status === 'pending').length,      Icon: AlertCircle,    accent: '#f59e0b' },
    ];

    const navItems = [
        { id: 'tasks', label: 'Tasks', Icon: CheckSquare, badge: tasks.length },
        { id: 'teams', label: 'Teams', Icon: Users },
    ];

    const teams = [
        { name: 'Marketing',     color: '#3b82f6' },
        { name: 'Product Dev',   color: '#8b5cf6' },
        { name: 'Brand Identity',color: '#10b981' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', background: '#020209', fontFamily: "'Inter', system-ui, sans-serif", color: '#94a3b8' }}>

            {/* ─── SIDEBAR ─── */}
            <aside style={{ width: 256, minWidth: 256, background: '#07070f', borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Logo */}
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e1e2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: '#4f46e5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(79,70,229,0.4)' }}>
                            <LayoutDashboard size={18} color="white" />
                        </div>
                        <div>
                            <span style={{ color: 'white', fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>TaskFlow</span>
                            <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#818cf8', background: 'rgba(99,102,241,0.15)', padding: '2px 6px', borderRadius: 6 }}>PRO</span>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Workspace</p>

                    {navItems.map(item => {
                        const active = activeNav === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveNav(item.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                                    background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                                    color: active ? 'white' : '#64748b',
                                    fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                                    cursor: 'pointer', border: 'none',
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <item.Icon size={16} color={active ? '#818cf8' : 'currentColor'} />
                                    {item.label}
                                </div>
                                {item.badge !== undefined && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: active ? 'rgba(99,102,241,0.2)' : '#1e1e2e', color: active ? '#a5b4fc' : '#475569' }}>
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}

                    <p style={{ fontSize: 10, fontWeight: 700, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>My Teams</p>

                    {teams.map(t => (
                        <button key={t.name} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, color: '#64748b', fontWeight: 600, fontSize: 13, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }}></span>
                            {t.name}
                        </button>
                    ))}
                </nav>

                {/* User */}
                <div style={{ padding: '12px', borderTop: '1px solid #1e1e2e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 12, background: '#0f0f1a' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                            {user?.username?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: 'white', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username ?? 'User'}</p>
                            <p style={{ color: '#475569', fontSize: 11, fontWeight: 500 }}>Pro Account</p>
                        </div>
                        <button onClick={handleLogout} title="Logout" style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex' }}>
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── MAIN ─── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

                {/* Header */}
                <header style={{ height: 64, flexShrink: 0, background: '#07070f', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', gap: 16 }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#334155' }} size={15} />
                        <input type="text" placeholder="Search tasks..."
                            style={{ width: '100%', background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 10, padding: '8px 12px 8px 36px', fontSize: 13, color: '#94a3b8', outline: 'none', fontFamily: 'inherit' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <button style={{ position: 'relative', width: 36, height: 36, background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                            <Bell size={16} />
                            <span style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: '#4f46e5', borderRadius: '50%', border: '1px solid #07070f' }}></span>
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#4f46e5', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 0 20px rgba(79,70,229,0.3)', fontFamily: 'inherit' }}>
                            <Plus size={15} /> New Task
                        </button>
                    </div>
                </header>

                {/* Body */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>

                    {/* Page Title */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, letterSpacing: '-0.5px', marginBottom: 4 }}>
                            Good to see you, {user?.username} 👋
                        </h1>
                        <p style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>
                            {tasks.length === 0
                                ? "You're all caught up! Create your first task."
                                : `You have ${tasks.filter(t => t.status !== 'completed').length} active tasks.`}
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                        {stats.map(s => (
                            <div key={s.label} style={{ background: '#07070f', border: '1px solid #1e1e2e', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <s.Icon size={15} color={s.accent} />
                                    </div>
                                </div>
                                <p style={{ color: 'white', fontWeight: 900, fontSize: 32, lineHeight: 1 }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Task List */}
                    <div style={{ background: '#07070f', border: '1px solid #1e1e2e', borderRadius: 16, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #1e1e2e' }}>
                            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>All Tasks</h2>
                            <span style={{ color: '#475569', fontSize: 12, fontWeight: 500 }}>{tasks.length} total</span>
                        </div>

                        {tasks.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center' }}>
                                <div style={{ width: 52, height: 52, background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                    <CheckSquare size={22} color="#334155" />
                                </div>
                                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No tasks yet</h3>
                                <p style={{ color: '#475569', fontSize: 13, maxWidth: 240 }}>Click "New Task" to start tracking your team's work.</p>
                            </div>
                        ) : (
                            tasks.map((task, i) => {
                                const s = statusConfig[task.status] ?? statusConfig.pending;
                                return (
                                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < tasks.length - 1 ? '1px solid #1e1e2e' : 'none', borderLeft: `3px solid ${s.bar}`, cursor: 'pointer' }}>
                                        <s.Icon size={17} color={s.bar} style={{ flexShrink: 0 }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#475569', fontWeight: 500 }}>
                                                <span>{task.team_name ?? 'General'}</span>
                                                {task.due_date && <><span>·</span><span>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></>}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#a5b4fc' }}>
                                                    {task.assignee_name?.[0]?.toUpperCase() ?? '?'}
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>{task.assignee_name}</span>
                                            </div>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: `${s.bar}18`, color: s.bar }}>
                                                {s.label}
                                            </span>
                                            <ChevronRight size={14} color="#334155" />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
