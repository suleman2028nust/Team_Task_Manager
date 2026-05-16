import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, CheckSquare, Users, LogOut,
    Plus, Search, Bell, ChevronRight, Clock,
    AlertCircle, CheckCircle2, Circle, TrendingUp, BarChart3, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS = {
    completed:   { label: 'Completed',   color: '#10b981', Icon: CheckCircle2 },
    in_progress: { label: 'In Progress', color: '#3b82f6', Icon: Clock },
    pending:     { label: 'Pending',     color: '#f59e0b', Icon: Circle },
};

const PRIORITY = {
    urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#6b7280'
};

/* ── tiny style helpers ── */
const S = {
    page:    { position:'fixed', inset:0, display:'flex', background:'#020209', fontFamily:"'Inter',system-ui,sans-serif", color:'#94a3b8' },
    sidebar: { width:256, minWidth:256, background:'#07070f', borderRight:'1px solid #1e1e2e', display:'flex', flexDirection:'column', overflow:'hidden' },
    main:    { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },
    header:  { height:64, flexShrink:0, background:'#07070f', borderBottom:'1px solid #1e1e2e', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', gap:14 },
    body:    { flex:1, overflowY:'auto', padding:28 },
    card:    { background:'#07070f', border:'1px solid #1e1e2e', borderRadius:14, overflow:'hidden' },
    input:   { width:'100%', background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:9, padding:'9px 12px', fontSize:13, color:'#e2e8f0', outline:'none', fontFamily:'inherit', boxSizing:'border-box' },
    label:   { display:'block', fontSize:11, fontWeight:700, color:'#475569', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.07em' },
    btn:     { display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#4f46e5', border:'none', borderRadius:9, color:'white', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' },
    btnGhost:{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', background:'#0f0f1a', border:'1px solid #1e1e2e', borderRadius:9, color:'#64748b', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' },
    overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:20 },
    modal:   { background:'#0d0d18', border:'1px solid #1e1e2e', borderRadius:18, padding:28, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' },
};

export default function Dashboard() {
    const [user,       setUser]       = useState(null);
    const [tasks,      setTasks]      = useState([]);
    const [teams,      setTeams]      = useState([]);
    const [stats,      setStats]      = useState({ total:0, pending:0, in_progress:0, completed:0, teams:0 });
    const [search,     setSearch]     = useState('');
    const [activeNav,  setActiveNav]  = useState('tasks');
    const [loading,    setLoading]    = useState(true);
    const [showModal,  setShowModal]  = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title:'', description:'', team_id:'', priority:'medium', status:'pending', due_date:'', assigned_to:'' });
    const navigate = useNavigate();

    /* ── load on mount ── */
    useEffect(() => {
        (async () => {
            try {
                const me = await api.get('/auth/me');
                if (!me.data.loggedIn) { navigate('/login'); return; }
                setUser(me.data.user);
                await refresh();
            } finally { setLoading(false); }
        })();
    }, []);

    const refresh = async () => {
        const [dash, teamsRes] = await Promise.all([api.get('/dashboard'), api.get('/teams')]);
        setStats(dash.data.stats);
        setTeams(teamsRes.data);
        const tasksRes = await api.get('/tasks');
        setTasks(tasksRes.data);
    };

    const handleLogout = async () => { await api.post('/auth/logout'); navigate('/login'); };

    /* ── create task ── */
    const handleCreate = async e => {
        e.preventDefault();
        if (!form.title || !form.team_id) return;
        setSubmitting(true);
        try {
            await api.post('/tasks', {
                title:       form.title,
                description: form.description || undefined,
                team_id:     parseInt(form.team_id),
                priority:    form.priority,
                status:      form.status,
                due_date:    form.due_date || undefined,
                assigned_to: form.assigned_to ? parseInt(form.assigned_to) : undefined,
            });
            setShowModal(false);
            setForm({ title:'', description:'', team_id:'', priority:'medium', status:'pending', due_date:'', assigned_to:'' });
            await refresh();
        } catch(err) {
            alert(err.response?.data?.message || 'Could not create task');
        } finally { setSubmitting(false); }
    };

    /* ── cycle task status ── */
    const cycleStatus = async (task) => {
        const order = ['pending','in_progress','completed'];
        const next  = order[(order.indexOf(task.status) + 1) % order.length];
        await api.put(`/tasks/${task.id}`, { status: next });
        await refresh();
    };

    /* ── filtered tasks ── */
    const filtered = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.team_name||'').toLowerCase().includes(search.toLowerCase())
    );

    const teamColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

    if (loading) return (
        <div style={{...S.page, alignItems:'center', justifyContent:'center'}}>
            <div style={{textAlign:'center'}}>
                <div style={{width:38,height:38,border:'2px solid #4f46e5',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 10px'}}/>
                <p style={{color:'#64748b',fontSize:13}}>Loading workspace…</p>
            </div>
        </div>
    );

    return (
        <>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={S.page}>

            {/* ── SIDEBAR ── */}
            <aside style={S.sidebar}>
                {/* Logo */}
                <div style={{padding:'22px 18px', borderBottom:'1px solid #1e1e2e'}}>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:35,height:35,background:'#4f46e5',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 18px rgba(79,70,229,0.4)'}}>
                            <LayoutDashboard size={17} color="white"/>
                        </div>
                        <span style={{color:'white',fontWeight:800,fontSize:16,letterSpacing:'-0.5px'}}>TaskFlow</span>
                        <span style={{fontSize:10,fontWeight:700,color:'#818cf8',background:'rgba(99,102,241,0.15)',padding:'2px 6px',borderRadius:6}}>PRO</span>
                    </div>
                </div>

                {/* Nav */}
                <nav style={{flex:1,padding:'14px 10px',overflowY:'auto'}}>
                    <p style={{fontSize:10,fontWeight:700,color:'#334155',letterSpacing:'0.1em',textTransform:'uppercase',padding:'0 8px',marginBottom:6}}>Workspace</p>
                    {[
                        { id:'tasks', label:'Tasks', Icon:CheckSquare, badge:stats.total },
                        { id:'teams', label:'Teams', Icon:Users,       badge:stats.teams },
                    ].map(({id,label,Icon,badge}) => {
                        const active = activeNav === id;
                        return (
                            <button key={id} onClick={()=>setActiveNav(id)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 10px',borderRadius:9,marginBottom:2,background:active?'rgba(99,102,241,0.12)':'transparent',color:active?'white':'#64748b',fontWeight:600,fontSize:13,border:'none',cursor:'pointer'}}>
                                <div style={{display:'flex',alignItems:'center',gap:9}}>
                                    <Icon size={15} color={active?'#818cf8':'currentColor'}/>
                                    {label}
                                </div>
                                <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99,background:active?'rgba(99,102,241,0.2)':'#1e1e2e',color:active?'#a5b4fc':'#475569'}}>{badge}</span>
                            </button>
                        );
                    })}

                    <p style={{fontSize:10,fontWeight:700,color:'#334155',letterSpacing:'0.1em',textTransform:'uppercase',padding:'0 8px',margin:'18px 0 6px'}}>My Teams</p>
                    {teams.length === 0
                        ? <p style={{fontSize:12,color:'#334155',padding:'0 8px'}}>No teams yet</p>
                        : teams.map((t,i) => (
                            <button key={t.id} onClick={()=>{setActiveNav('teams');}} style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'7px 10px',borderRadius:9,color:'#64748b',fontWeight:600,fontSize:12,border:'none',background:'transparent',cursor:'pointer'}}>
                                <span style={{width:7,height:7,borderRadius:'50%',background:teamColors[i%teamColors.length],flexShrink:0}}/>
                                {t.name}
                            </button>
                        ))
                    }
                </nav>

                {/* User */}
                <div style={{padding:10,borderTop:'1px solid #1e1e2e'}}>
                    <div style={{display:'flex',alignItems:'center',gap:9,padding:'9px 10px',borderRadius:11,background:'#0f0f1a'}}>
                        <div style={{width:32,height:32,borderRadius:8,background:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:13,flexShrink:0}}>
                            {user?.username?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                            <p style={{color:'white',fontWeight:700,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.username}</p>
                            <p style={{color:'#475569',fontSize:10,fontWeight:500}}>Pro Account</p>
                        </div>
                        <button onClick={handleLogout} style={{color:'#334155',background:'none',border:'none',cursor:'pointer',display:'flex',padding:3}}>
                            <LogOut size={14}/>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={S.main}>
                {/* Header */}
                <header style={S.header}>
                    <div style={{position:'relative',flex:1,maxWidth:340}}>
                        <Search style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#334155'}} size={14}/>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…"
                            style={{...S.input, paddingLeft:34, width:'100%'}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <button style={{width:35,height:35,background:'#0f0f1a',border:'1px solid #1e1e2e',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b',cursor:'pointer',position:'relative'}}>
                            <Bell size={15}/>
                        </button>
                        <button onClick={()=>setShowModal(true)} style={{...S.btn, boxShadow:'0 0 18px rgba(79,70,229,0.3)'}}>
                            <Plus size={15}/> New Task
                        </button>
                    </div>
                </header>

                {/* Body */}
                <main style={S.body}>
                    {activeNav === 'tasks' && (
                        <>
                            {/* Greeting */}
                            <div style={{marginBottom:24}}>
                                <h1 style={{color:'white',fontWeight:900,fontSize:22,letterSpacing:'-0.4px',marginBottom:4}}>
                                    Good to see you, {user?.username} 👋
                                </h1>
                                <p style={{color:'#475569',fontSize:13}}>
                                    {tasks.length === 0 ? "No tasks yet — create your first one!" : `${tasks.filter(t=>t.status!=='completed').length} active task(s).`}
                                </p>
                            </div>

                            {/* Stats */}
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
                                {[
                                    { label:'Total Tasks',  value:stats.total,       accent:'#6366f1', Icon:BarChart3     },
                                    { label:'In Progress',  value:stats.in_progress, accent:'#3b82f6', Icon:TrendingUp    },
                                    { label:'Completed',    value:stats.completed,   accent:'#10b981', Icon:CheckCircle2  },
                                    { label:'Pending',      value:stats.pending,     accent:'#f59e0b', Icon:AlertCircle   },
                                ].map(s=>(
                                    <div key={s.label} style={{...S.card, padding:18}}>
                                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                                            <p style={{fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.08em'}}>{s.label}</p>
                                            <div style={{width:30,height:30,borderRadius:8,background:`${s.accent}20`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                <s.Icon size={14} color={s.accent}/>
                                            </div>
                                        </div>
                                        <p style={{color:'white',fontWeight:900,fontSize:30,lineHeight:1}}>{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Task list */}
                            <div style={S.card}>
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 22px',borderBottom:'1px solid #1e1e2e'}}>
                                    <h2 style={{color:'white',fontWeight:700,fontSize:13}}>All Tasks</h2>
                                    <span style={{color:'#475569',fontSize:12}}>{filtered.length} total</span>
                                </div>
                                {filtered.length === 0 ? (
                                    <div style={{padding:'60px 20px',textAlign:'center'}}>
                                        <CheckSquare size={28} color="#334155" style={{margin:'0 auto 12px'}}/>
                                        <p style={{color:'white',fontWeight:700,marginBottom:4}}>No tasks found</p>
                                        <p style={{color:'#475569',fontSize:13}}>Click "New Task" to get started.</p>
                                    </div>
                                ) : filtered.map((task, i) => {
                                    const s = STATUS[task.status] || STATUS.pending;
                                    return (
                                        <div key={task.id} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 22px',borderBottom:i<filtered.length-1?'1px solid #1e1e2e':'none',borderLeft:`3px solid ${s.color}`,cursor:'pointer',transition:'background 0.1s'}}
                                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                                            {/* status icon — click to cycle */}
                                            <button onClick={()=>cycleStatus(task)} title="Click to change status"
                                                style={{background:'none',border:'none',cursor:'pointer',padding:0,display:'flex',flexShrink:0,color:s.color}}>
                                                <s.Icon size={17} color={s.color}/>
                                            </button>
                                            <div style={{flex:1,minWidth:0}}>
                                                <p style={{color:'#e2e8f0',fontWeight:600,fontSize:13,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{task.title}</p>
                                                <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'#475569'}}>
                                                    <span>{task.team_name||'General'}</span>
                                                    {task.due_date && <><span>·</span><span>Due {new Date(task.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></>}
                                                    {task.assignee_name && task.assignee_name !== 'Unassigned' && <><span>·</span><span>@{task.assignee_name}</span></>}
                                                </div>
                                            </div>
                                            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                                                {task.priority && (
                                                    <span style={{width:6,height:6,borderRadius:'50%',background:PRIORITY[task.priority]||'#6b7280'}} title={task.priority}/>
                                                )}
                                                <span style={{fontSize:11,fontWeight:700,padding:'4px 9px',borderRadius:7,background:`${s.color}18`,color:s.color}}>{s.label}</span>
                                                <ChevronRight size={13} color="#334155"/>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeNav === 'teams' && (
                        <>
                            <div style={{marginBottom:24}}>
                                <h1 style={{color:'white',fontWeight:900,fontSize:22,letterSpacing:'-0.4px',marginBottom:4}}>My Teams</h1>
                                <p style={{color:'#475569',fontSize:13}}>Teams you're a member of.</p>
                            </div>
                            {teams.length === 0 ? (
                                <div style={{...S.card, padding:60, textAlign:'center'}}>
                                    <Users size={28} color="#334155" style={{margin:'0 auto 12px'}}/>
                                    <p style={{color:'white',fontWeight:700,marginBottom:4}}>No teams yet</p>
                                    <p style={{color:'#475569',fontSize:13}}>Ask someone to add you to a team.</p>
                                </div>
                            ) : (
                                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
                                    {teams.map((t,i)=>(
                                        <div key={t.id} style={{...S.card, padding:20}}>
                                            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                                                <div style={{width:38,height:38,borderRadius:10,background:`${teamColors[i%teamColors.length]}22`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                    <Users size={16} color={teamColors[i%teamColors.length]}/>
                                                </div>
                                                <div>
                                                    <p style={{color:'white',fontWeight:700,fontSize:14}}>{t.name}</p>
                                                    <p style={{color:'#475569',fontSize:11}}>Team</p>
                                                </div>
                                            </div>
                                            {t.description && <p style={{color:'#64748b',fontSize:12,lineHeight:1.5}}>{t.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>

        {/* ── NEW TASK MODAL ── */}
        {showModal && (
            <div style={S.overlay} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
                <div style={S.modal}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
                        <h2 style={{color:'white',fontWeight:800,fontSize:17}}>Create New Task</h2>
                        <button onClick={()=>setShowModal(false)} style={{color:'#475569',background:'none',border:'none',cursor:'pointer',display:'flex'}}>
                            <X size={20}/>
                        </button>
                    </div>
                    <form onSubmit={handleCreate} style={{display:'flex',flexDirection:'column',gap:14}}>
                        <div>
                            <label style={S.label}>Title *</label>
                            <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title…" style={S.input}/>
                        </div>
                        <div>
                            <label style={S.label}>Description</label>
                            <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description…" rows={3}
                                style={{...S.input, resize:'vertical'}}/>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                            <div>
                                <label style={S.label}>Team *</label>
                                <select required value={form.team_id} onChange={e=>setForm(f=>({...f,team_id:e.target.value}))} style={S.input}>
                                    <option value="">Select team…</option>
                                    {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Priority</label>
                                <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} style={S.input}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                            <div>
                                <label style={S.label}>Status</label>
                                <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} style={S.input}>
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Due Date</label>
                                <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} style={S.input}/>
                            </div>
                        </div>
                        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
                            <button type="button" onClick={()=>setShowModal(false)} style={S.btnGhost}>Cancel</button>
                            <button type="submit" disabled={submitting} style={{...S.btn, opacity:submitting?0.6:1}}>
                                {submitting ? 'Creating…' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}
