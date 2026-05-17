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
    const [editingTask, setEditingTask] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [filterTeam, setFilterTeam] = useState('all');
    const [filterAssignee, setFilterAssignee] = useState('all');
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [memberId, setMemberId] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamForm, setTeamForm] = useState({ name: '', description: '' });
    const [showManageModal, setShowManageModal] = useState(false);
    const [manageTeam, setManageTeam] = useState(null);
    const [manageMembers, setManageMembers] = useState([]);
    const [selectedTeamView, setSelectedTeamView] = useState(null); // team clicked to view tasks
    const [teamTasks, setTeamTasks] = useState([]);
    const [loadingTeamTasks, setLoadingTeamTasks] = useState(false);
    const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
    const [confirmAction, setConfirmAction] = useState(null); // { message: '', onConfirm: () => void }
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [showSidebar, setShowSidebar] = useState(window.innerWidth > 768);

    /* ── load on mount ── */
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) setShowSidebar(true);
            else setShowSidebar(false);
        };
        window.addEventListener('resize', handleResize);
        
        (async () => {
            try {
                const me = await api.get('/auth/me');
                if (!me.data.loggedIn) { navigate('/login'); return; }
                setUser(me.data.user);
                await refresh();
            } finally { setLoading(false); }
        })();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const refresh = async () => {
        try {
            const [dash, teamsRes] = await Promise.all([api.get('/dashboard'), api.get('/teams')]);
            setStats(dash.data.stats);
            setTeams(teamsRes.data);
            const tasksRes = await api.get('/tasks');
            setTasks(tasksRes.data);
            
            if (selectedTeamView) {
                const res = await api.get(`/teams/${selectedTeamView.id}/tasks`);
                setTeamTasks(res.data);
            }
        } catch (err) {
            console.error("Refresh error:", err);
        }
    };

    const handleLogout = async () => { await api.post('/auth/logout'); navigate('/login'); };

    /* ── create or update task ── */
    const handleSubmit = async e => {
        e.preventDefault();
        const teamId = editingTask ? editingTask.team_id : parseInt(form.team_id);
        const activeTeam = teams.find(t => t.id === teamId);
        const isLeader = activeTeam?.created_by === user?.id;

        if (!form.title || !teamId) return;
        setSubmitting(true);
        try {
            let payload;
            if (editingTask && !isLeader) {
                // Member can only update status
                payload = { status: form.status };
            } else {
                payload = {
                    title:       form.title,
                    description: form.description || '',
                    team_id:     parseInt(form.team_id),
                    priority:    form.priority,
                    status:      form.status,
                    due_date:    form.due_date || null,
                    assigned_to: form.assigned_to ? parseInt(form.assigned_to) : null,
                };
            }

            if (editingTask) {
                await api.put(`/tasks/${editingTask.id}`, payload);
            } else {
                await api.post('/tasks', payload);
            }

            setShowModal(false);
            setEditingTask(null);
            setForm({ title:'', description:'', team_id:'', priority:'medium', status:'pending', due_date:'', assigned_to:'' });
            await refresh();
        } catch(err) {
            alert(err.response?.data?.message || 'Operation failed');
        } finally { setSubmitting(false); }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setShowModal(false);
            await refresh();
        } catch (err) { alert(err.response?.data?.message || 'Could not delete task'); }
    };

    const openEditModal = async (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description || '',
            team_id: task.team_id || '',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
            assigned_to: task.assigned_to || ''
        });
        if (task.team_id) {
            try {
                const res = await api.get(`/teams/${task.team_id}/members`);
                setTeamMembers(res.data);
            } catch (err) { console.error("Error fetching members", err); }
        }
        setShowModal(true);
    };

    const handleTeamChange = async (teamId) => {
        setForm(f => ({ ...f, team_id: teamId, assigned_to: '' }));
        if (teamId) {
            try {
                const res = await api.get(`/teams/${teamId}/members`);
                setTeamMembers(res.data);
            } catch (err) { console.error("Error fetching members", err); }
        } else {
            setTeamMembers([]);
        }
    };

    /* ── cycle task status ── */
    const cycleStatus = async (task) => {
        const order = ['pending','in_progress','completed'];
        const next  = order[(order.indexOf(task.status) + 1) % order.length];
        await api.put(`/tasks/${task.id}`, { status: next });
        await refresh();
    };

    const handleAddMember = async (userId) => {
        if (!selectedTeam || !userId) return;
        try {
            await api.post(`/teams/${selectedTeam.id}/members`, { userId });
            setShowMemberModal(false);
            setUserSearch('');
            setSearchResults([]);
            showToast('Member added successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not add member', 'error');
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (userSearch.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await api.get(`/auth/users/search?q=${userSearch}`);
                    setSearchResults(res.data);
                } catch (err) { console.error("Search error", err); }
                finally { setIsSearching(false); }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [userSearch]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!teamForm.name) return;
        setSubmitting(true);
        try {
            await api.post('/teams', teamForm);
            setShowTeamModal(false);
            setTeamForm({ name: '', description: '' });
            await refresh();
            showToast('Team created successfully!', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Could not create team', 'error');
        } finally { setSubmitting(false); }
    };

    const openManageModal = async (team) => {
        setManageTeam(team);
        try {
            const res = await api.get(`/teams/${team.id}/members`);
            setManageMembers(res.data);
            setShowManageModal(true);
        } catch (err) { console.error("Manage error", err); }
    };

    const viewTeamTasks = async (team) => {
        setSelectedTeamView(team);
        setTeamTasks([]); // clear immediately so stale data doesn't flash
        setLoadingTeamTasks(true);
        try {
            const res = await api.get(`/teams/${team.id}/tasks`);
            setTeamTasks(res.data);
        } catch (err) { console.error('Team tasks error', err); setTeamTasks([]); }
        finally { setLoadingTeamTasks(false); }
    };

    const openAddMemberModal = async (team) => {
        setSelectedTeam(team);
        try {
            const res = await api.get(`/teams/${team.id}/members`);
            setTeamMembers(res.data);
            setShowMemberModal(true);
        } catch (err) { console.error("Error fetching members", err); }
    };

    const handleRemoveMember = async (userId) => {
        if (!manageTeam || !userId) return;
        setConfirmAction({
            message: "Are you sure you want to remove this member from the team?",
            onConfirm: async () => {
                try {
                    await api.delete(`/teams/${manageTeam.id}/members/${userId}`);
                    const res = await api.get(`/teams/${manageTeam.id}/members`);
                    setManageMembers(res.data);
                    await refresh();
                    showToast('Member removed successfully!', 'success');
                } catch (err) {
                    showToast(err.response?.data?.message || 'Could not remove member', 'error');
                }
                setConfirmAction(null);
            }
        });
    };

    const handleDeleteTeam = async (teamId) => {
        setConfirmAction({
            message: "Are you sure? This will delete the team and all its tasks permanently.",
            onConfirm: async () => {
                try {
                    await api.delete(`/teams/${teamId}`);
                    await refresh();
                    showToast('Team deleted successfully!', 'success');
                } catch (err) {
                    showToast(err.response?.data?.message || 'Could not delete team', 'error');
                }
                setConfirmAction(null);
            }
        });
    };

    /* ── filtered tasks ── */
    const filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                            (t.team_name||'').toLowerCase().includes(search.toLowerCase());
        const matchesTeam = filterTeam === 'all' || t.team_id === parseInt(filterTeam);
        const matchesAssignee = filterAssignee === 'all' || 
                               (filterAssignee === 'unassigned' ? !t.assigned_to : t.assigned_to === parseInt(filterAssignee));
        return matchesSearch && matchesTeam && matchesAssignee;
    });

    const teamColors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444'];

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#020209] font-sans text-[#cbd5e1]">
            <div className="text-center">
                <div className="w-[38px] h-[38px] border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5"/>
                <p className="text-[#64748b] text-[13px]">Loading workspace…</p>
            </div>
        </div>
    );

    return (
        <>
        <style>{`
            select option { background: #0f0f1a; color: #f8fafc; }
            input[type="date"] {
                color-scheme: dark;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                cursor: pointer;
                opacity: 0.8;
                transition: 0.2s;
            }
            input[type="date"]::-webkit-calendar-picker-indicator:hover {
                opacity: 1;
            }
        `}</style>
        <div className="fixed inset-0 flex bg-[#020209] font-sans text-[#cbd5e1] overflow-hidden">

            {/* ── SIDEBAR ── */}
            <aside className="sidebar-el w-64 min-w-[256px] bg-[#07070f] border-r border-[#1e1e2e] flex flex-col overflow-hidden transition-transform duration-300 md:relative md:translate-x-0" style={{
                transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                position: window.innerWidth <= 768 ? 'fixed' : 'relative',
                zIndex: window.innerWidth <= 768 ? 100 : 'auto',
                height: window.innerWidth <= 768 ? '100%' : 'auto'
            }}>
                {/* Logo */}
                <div className="py-[22px] px-[18px] border-b border-[#1e1e2e] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[35px] h-[35px] bg-[#4f46e5] rounded-[10px] flex items-center justify-center shadow-[0_0_18px_rgba(79,70,229,0.4)]">
                            <LayoutDashboard size={17} color="white"/>
                        </div>
                        <span className="text-white font-extrabold text-base tracking-tight">TaskFlow</span>
                    </div>
                    {window.innerWidth <= 768 && (
                        <button onClick={() => setShowSidebar(false)} className="background-none border-0 text-slate-500 cursor-pointer flex hover:text-slate-300 transition-colors">
                            <X size={20}/>
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-2 mb-1.5">Workspace</p>
                    {[
                        { id:'tasks', label:'Tasks', Icon:CheckSquare, badge:stats.total },
                        { id:'teams', label:'Teams', Icon:Users,       badge:stats.teams },
                    ].map(({id,label,Icon,badge}) => {
                        const active = activeNav === id;
                        return (
                            <button key={id} onClick={()=>setActiveNav(id)} className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg mb-0.5 transition-colors text-sm font-semibold border-0 cursor-pointer ${active ? 'bg-indigo-600/12 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}`} style={{background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent'}}>
                                <div className="flex items-center gap-2.5">
                                    <Icon size={15} color={active?'#818cf8':'currentColor'}/>
                                    {label}
                                </div>
                                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${active ? 'bg-indigo-600/20 text-[#a5b4fc]' : 'bg-[#1e1e2e] text-slate-400'}`}>{badge}</span>
                            </button>
                        );
                    })}

                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-2 mt-4.5 mb-1.5" style={{ marginTop: '18px' }}>My Teams</p>
                    {teams.length === 0
                        ? <p className="text-xs text-slate-600 px-2">No teams yet</p>
                        : teams.map((t,i) => (
                            <button key={t.id} onClick={()=>{setActiveNav('teams'); viewTeamTasks(t);}} className="w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg text-slate-500 hover:text-slate-300 font-semibold text-[12px] border-0 bg-transparent cursor-pointer">
                                <span className="w-1.75 h-1.75 rounded-full flex-shrink-0" style={{ width: 7, height: 7, background: teamColors[i%teamColors.length] }}/>
                                {t.name}
                            </button>
                        ))
                    }
                </nav>

                {/* User */}
                <div className="p-2.5 border-t border-[#1e1e2e]">
                    <div className="flex items-center gap-2.5 py-2 px-2.5 rounded-[11px] bg-[#0f0f1a]">
                        <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                            {user?.username?.[0]?.toUpperCase()||'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{user?.username}</p>
                        </div>
                        <button onClick={handleLogout} className="text-slate-600 bg-transparent border-0 cursor-pointer flex p-0.75 hover:text-red-400 transition-colors">
                            <LogOut size={14}/>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Header */}
                <header className="h-16 shrink-0 bg-[#07070f] border-b border-[#1e1e2e] flex items-center justify-between px-7 gap-3.5">
                    <div className="flex items-center gap-3 flex-1 max-w-[380px]">
                        {window.innerWidth <= 768 && (
                            <button onClick={() => setShowSidebar(true)} className="bg-transparent border-0 text-slate-500 cursor-pointer flex hover:text-slate-300 transition-colors">
                                <LayoutDashboard size={20}/>
                            </button>
                        )}
                        <div className="relative flex-1">
                            <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14}/>
                            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…"
                                className="w-full h-[38px] bg-[#0f0f1a] border border-slate-700 rounded-lg pl-[34px] pr-3 text-xs text-slate-100 placeholder-slate-600 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        {/* Team Filter */}
                        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="w-[130px] h-[38px] bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
                            <option value="all">All Teams</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name} {t.created_by === user?.id ? '(Lead)' : ''}</option>)}
                        </select>
                        
                        {/* Assignee Filter */}
                        <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="w-[130px] h-[38px] bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
                            <option value="all">All Members</option>
                            <option value="unassigned">Unassigned</option>
                            {user && <option value={user.id}>Me (@{user.username})</option>}
                        </select>

                        {/* Only show New Task if user is a leader of AT LEAST one team */}
                        {teams.some(t => t.created_by === user?.id) && (
                            <button onClick={()=>{setEditingTask(null); setForm({ title:'', description:'', team_id:'', priority:'medium', status:'pending', due_date:'', assigned_to:'' }); setShowModal(true)}} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#4f46e5] hover:bg-[#4338ca] border-0 rounded-lg text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all">
                                <Plus size={15}/> New Task
                            </button>
                        )}
                    </div>
                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto p-7">
                    {activeNav === 'tasks' && (
                        <>
                            {/* Greeting */}
                            <div className="mb-6">
                                <h1 className="text-white font-black text-2xl tracking-tight mb-1">
                                    Good to see you, {user?.username} 👋
                                </h1>
                                <p className="text-slate-400 text-[13px]">
                                    {tasks.length === 0 ? "No tasks assigned to you yet." : `${tasks.filter(t=>t.status!=='completed').length} active task(s) assigned to you.`}
                                </p>
                                
                                {/* Reminders */}
                                {tasks.some(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)) && (
                                    <div className="mt-3.5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2.5">
                                        <AlertCircle size={16} color="#ef4444"/>
                                        <span className="text-[12px] text-red-400 font-semibold">
                                            Attention: You have tasks that are due within 24 hours or overdue!
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                                {[
                                    { label:'Total Tasks',  value:stats.total,       accent:'#6366f1', Icon:BarChart3     },
                                    { label:'In Progress',  value:stats.in_progress, accent:'#3b82f6', Icon:TrendingUp    },
                                    { label:'Completed',    value:stats.completed,   accent:'#10b981', Icon:CheckCircle2  },
                                    { label:'Pending',      value:stats.pending,     accent:'#f59e0b', Icon:AlertCircle   },
                                ].map(s=>(
                                    <div key={s.label} className="bg-[#07070f] border border-[#1e1e2e] rounded-[14px] overflow-hidden p-4.5" style={{ padding: '18px' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                                            <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center" style={{ background: `${s.accent}20` }}>
                                                <s.Icon size={14} color={s.accent}/>
                                            </div>
                                        </div>
                                        <p className="text-white font-black text-3xl leading-none">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Task list */}
                            <div className="bg-[#07070f] border border-[#1e1e2e] rounded-[14px] overflow-hidden">
                                <div className="flex items-center justify-between py-3.5 px-5.5 border-b border-[#1e1e2e]">
                                    <h2 className="text-white font-bold text-xs uppercase tracking-wider">All Tasks</h2>
                                    <span className="text-slate-400 text-xs">{filtered.length} total</span>
                                </div>
                                {filtered.length === 0 ? (
                                    <div className="py-15 px-5 text-center" style={{ padding: '60px 20px' }}>
                                        <CheckSquare size={28} color="#94a3b8" className="mx-auto mb-3"/>
                                        <p className="text-white font-bold mb-1">No tasks found</p>
                                        <p className="text-slate-400 text-[13px]">Click "New Task" to get started.</p>
                                    </div>
                                ) : filtered.map((task, i) => {
                                    const s = STATUS[task.status] || STATUS.pending;
                                    return (
                                        <div key={task.id} 
                                            onClick={() => openEditModal(task)}
                                            className="flex items-center gap-3.5 py-3 px-5.5 border-b last:border-b-0 border-[#1e1e2e] border-l-[3px] cursor-pointer hover:bg-white/[0.02] transition-all"
                                            style={{ borderLeftColor: s.color }}>
                                            {/* status icon — click to cycle */}
                                            <button onClick={(e)=>{e.stopPropagation(); cycleStatus(task);}} title="Click to change status"
                                                className="bg-transparent border-0 cursor-pointer p-0 flex shrink-0" style={{ color: s.color }}>
                                                <s.Icon size={17} color={s.color}/>
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-200 font-semibold text-xs mb-0.5 truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    <span>{task.team_name||'General'}</span>
                                                    {task.due_date && <><span>·</span><span>Due {new Date(task.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></>}
                                                    {task.assignee_name && task.assignee_name !== 'Unassigned' && <><span>·</span><span>@{task.assignee_name}</span></>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                {task.priority && (
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY[task.priority]||'#6b7280' }} title={task.priority}/>
                                                )}
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded transition-all" style={{ backgroundColor: `${s.color}18`, color: s.color }}>{s.label}</span>
                                                <ChevronRight size={13} className="text-slate-700"/>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {activeNav === 'teams' && !selectedTeamView && (
                        <>
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-white font-black text-2xl tracking-tight mb-1">My Teams</h1>
                                    <p className="text-slate-400 text-[13px]">Teams you're a member of.</p>
                                </div>
                                <button onClick={() => setShowTeamModal(true)} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#4f46e5] hover:bg-[#4338ca] border-0 rounded-lg text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all">
                                    <Plus size={15}/> New Team
                                </button>
                            </div>
                            {teams.length === 0 ? (
                                <div className="bg-[#07070f] border border-[#1e1e2e] rounded-[14px] overflow-hidden p-15 text-center" style={{ padding: '60px 20px' }}>
                                    <Users size={28} color="#94a3b8" className="mx-auto mb-3"/>
                                    <p className="text-white font-bold mb-1">No teams yet</p>
                                    <p className="text-slate-400 text-[13px]">Ask someone to add you to a team.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                    {teams.map((t,i)=>{
                                        const isLeader = t.created_by === user?.id;
                                        return (
                                        <div key={t.id} className="bg-[#07070f] border border-[#1e1e2e] rounded-[14px] overflow-hidden p-5 relative">
                                            {isLeader && (
                                                <span className="absolute top-3 right-3 text-[9px] font-extrabold bg-indigo-500/20 text-[#818cf8] py-0.5 px-1.5 rounded uppercase">Leader</span>
                                            )}
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center" style={{ background: `${teamColors[i%teamColors.length]}22` }}>
                                                    <Users size={16} color={teamColors[i%teamColors.length]}/>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-bold text-sm">{t.name}</p>
                                                    <p className="text-slate-500 text-[11px]">Team</p>
                                                </div>
                                            </div>
                                            {t.description && <p className="text-slate-400 text-xs leading-relaxed mb-4">{t.description}</p>}
                                            
                                            {/* View Tasks button for all members */}
                                            <button onClick={() => viewTeamTasks(t)} className="flex items-center gap-1.5 h-9 w-full justify-center bg-[#0f0f1a] hover:bg-slate-900 border border-slate-700 rounded-lg text-[#e2e8f0] font-semibold text-[11px] mb-2 cursor-pointer transition-colors">
                                                <CheckSquare size={12}/> View Team Tasks
                                            </button>

                                            <div className="flex gap-2">
                                                {isLeader ? (
                                                    <>
                                                        <button onClick={() => openAddMemberModal(t)} className="flex items-center gap-1 h-9 justify-center bg-[#0f0f1a] hover:bg-slate-900 border border-slate-700 rounded-lg text-[#e2e8f0] font-semibold text-[11px] cursor-pointer transition-colors flex-1" style={{ padding: '6px' }}>
                                                            <Plus size={12}/> Add Member
                                                        </button>
                                                        <button onClick={() => openManageModal(t)} className="flex items-center gap-1 h-9 justify-center bg-[#0f0f1a] hover:bg-slate-900 border border-indigo-900/50 rounded-lg text-[#818cf8] font-semibold text-[11px] cursor-pointer transition-colors flex-1" style={{ padding: '6px' }}>
                                                            Manage
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => openManageModal(t)} className="flex items-center gap-1 h-9 w-full justify-center bg-[#0f0f1a] hover:bg-slate-900 border border-slate-700 rounded-lg text-[#e2e8f0] font-semibold text-[11px] cursor-pointer transition-colors" style={{ padding: '6px' }}>
                                                        <Users size={12}/> View Members
                                                    </button>
                                                )}
                                            </div>
                                            {isLeader && (
                                                <button onClick={() => handleDeleteTeam(t.id)} 
                                                    className="w-full mt-2.5 bg-transparent border-0 text-red-500 text-[11px] font-bold cursor-pointer text-center hover:opacity-80 transition-all">
                                                    Delete Team
                                                </button>
                                            )}
                                        </div>
                                    )})}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── TEAM TASK VIEW ── */}
                    {activeNav === 'teams' && selectedTeamView && (
                        <>
                            <div className="mb-6 flex items-center gap-3.5">
                                <button onClick={() => setSelectedTeamView(null)} className="flex items-center gap-1.5 h-9 px-3.5 bg-[#0f0f1a] hover:bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer transition-colors" style={{ padding: '7px 12px' }}>
                                    ← Back to Teams
                                </button>
                                <div>
                                    <h1 className="text-white font-black text-2xl tracking-tight mb-0.5">
                                        {selectedTeamView.name} — All Tasks
                                    </h1>
                                    <p className="text-slate-400 text-[13px]">{teamTasks.length} task(s) in this team</p>
                                </div>
                            </div>
                            <div className="bg-[#07070f] border border-[#1e1e2e] rounded-[14px] overflow-hidden">
                                {loadingTeamTasks ? (
                                    <div className="p-5 px-5.5 flex flex-col gap-4" style={{ padding: '20px 22px' }}>
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="flex items-center gap-3.5 py-3 border-b last:border-b-0 border-[#1e1e2e]">
                                                <div className="w-[17px] h-[17px] rounded-full bg-[#16162a] animate-pulse"/>
                                                <div className="flex-1">
                                                    <div className="w-[35%] h-3 rounded bg-[#16162a] mb-2 animate-pulse"/>
                                                    <div className="w-[18%] h-2 rounded bg-[#16162a] animate-pulse"/>
                                                </div>
                                                <div className="w-[68px] h-5 rounded-lg bg-[#16162a] animate-pulse"/>
                                            </div>
                                        ))}
                                    </div>
                                ) : teamTasks.length === 0 ? (
                                    <div className="py-15 px-5 text-center" style={{ padding: '60px 20px' }}>
                                        <CheckSquare size={28} color="#94a3b8" className="mx-auto mb-3"/>
                                        <p className="text-white font-bold mb-1">No tasks in this team yet</p>
                                        <p className="text-slate-400 text-[13px]">Create a task and assign it to a member.</p>
                                    </div>
                                ) : teamTasks.map((task, i) => {
                                    const s = STATUS[task.status] || STATUS.pending;
                                    const isMyTask = task.assigned_to === user?.id;
                                    return (
                                        <div key={task.id}
                                            onClick={() => openEditModal(task)}
                                            className="flex items-center gap-3.5 py-3 px-5.5 border-b last:border-b-0 border-[#1e1e2e] border-l-[3px] cursor-pointer hover:bg-white/[0.02] transition-all"
                                            style={{ borderLeftColor: s.color }}>
                                            <button onClick={(e)=>{e.stopPropagation();cycleStatus(task);}} title="Click to change status"
                                                className="bg-transparent border-0 cursor-pointer p-0 flex shrink-0" style={{ color: s.color }}>
                                                <s.Icon size={17} color={s.color}/>
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-slate-200 font-semibold text-xs mb-0.5 truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                                    <span style={{color: isMyTask ? '#818cf8' : '#cbd5e1', fontWeight: isMyTask ? 700 : 500}}>@{task.assignee_name}{isMyTask ? ' (you)' : ''}</span>
                                                    {task.due_date && <><span>·</span><span>Due {new Date(task.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                {task.priority && <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY[task.priority]||'#6b7280' }} title={task.priority}/>}
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded transition-all" style={{ backgroundColor: `${s.color}18`, color: s.color }}>{s.label}</span>
                                                <ChevronRight size={13} className="text-slate-700"/>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>

        {/* ── ADD MEMBER MODAL ── */}
        {showMemberModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={e=>e.target===e.currentTarget&&setShowMemberModal(false)}>
                <div className="bg-[#0d0d18] border border-slate-700 rounded-2xl p-7 w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-extrabold text-[17px]">Add Member to {selectedTeam?.name}</h2>
                        <button onClick={()=>setShowMemberModal(false)} className="text-slate-500 bg-transparent border-0 cursor-pointer flex hover:text-slate-300">
                            <X size={20}/>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3.5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Search User</label>
                            <div className="relative">
                                <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14}/>
                                <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Type username or email…"
                                    className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg pl-[34px] pr-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"/>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5">* Search for users by their username or email address.</p>
                        </div>
                        
                        <div className="max-h-[200px] overflow-y-auto bg-[#0f0f1a] rounded-lg border border-[#1e1e2e]">
                            {isSearching ? (
                                <p className="p-3.5 text-xs text-slate-500 text-center">Searching…</p>
                            ) : searchResults.length === 0 ? (
                                <p className="p-3.5 text-xs text-slate-500 text-center">
                                    {userSearch.length < 2 ? 'Start typing to search…' : 'No users found.'}
                                </p>
                            ) : searchResults.map(u => {
                                const isAlreadyMember = teamMembers.some(m => m.id === u.id);
                                return (
                                <div key={u.id} className="flex items-center justify-between p-2.5 px-3.5 border-b last:border-b-0 border-[#1e1e2e]">
                                    <div>
                                        <p className="text-white font-semibold text-[13px]">{u.username}</p>
                                        <p className="text-slate-500 text-[11px]">{u.email}</p>
                                    </div>
                                    <button 
                                        onClick={() => !isAlreadyMember && handleAddMember(u.id)}
                                        disabled={isAlreadyMember}
                                        className={`flex items-center gap-1.5 h-8 px-3 border border-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer transition-colors ${isAlreadyMember ? 'text-slate-500 border-slate-800 opacity-60 cursor-not-allowed' : 'text-indigo-400 border-indigo-900/50 hover:bg-slate-900'}`}>
                                        {isAlreadyMember ? 'Added' : 'Add'}
                                    </button>
                                </div>
                            )})}
                        </div>

                        <div className="flex gap-2.5 justify-end mt-1">
                            <button type="button" onClick={()=>setShowMemberModal(false)} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#0f0f1a] border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-900 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── MANAGE MEMBERS MODAL ── */}
        {showManageModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={e=>e.target===e.currentTarget&&setShowManageModal(false)}>
                <div className="bg-[#0d0d18] border border-slate-700 rounded-2xl p-7 w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-extrabold text-[17px]">
                            {manageTeam?.created_by === user?.id ? 'Manage Members' : 'Team Members'}: {manageTeam?.name}
                        </h2>
                        <button onClick={()=>setShowManageModal(false)} className="text-slate-500 bg-transparent border-0 cursor-pointer flex hover:text-slate-300">
                            <X size={20}/>
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {manageMembers.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-2.5 px-3.5 bg-[#0f0f1a] rounded-[11px] border border-[#1e1e2e]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-[30px] h-[30px] rounded-lg bg-[#4f46e5] flex items-center justify-center text-white font-extrabold text-[11px] shrink-0">
                                        {m.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-[13px]">{m.username} {m.id === manageTeam.created_by && <span className="text-[9px] color-[#818cf8] font-bold ml-1">(Leader)</span>}</p>
                                        <p className="text-slate-500 text-[11px]">{m.email}</p>
                                    </div>
                                </div>
                                {manageTeam?.created_by === user?.id && m.id !== manageTeam.created_by && (
                                    <button onClick={() => handleRemoveMember(m.id)} className="bg-transparent border-0 text-red-500 text-[11px] font-bold cursor-pointer hover:opacity-80 transition-all">
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-5">
                        <button onClick={()=>setShowManageModal(false)} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#0f0f1a] border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-900 transition-colors">Close</button>
                    </div>
                </div>
            </div>
        )}

        {/* ── NEW TEAM MODAL ── */}
        {showTeamModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={e=>e.target===e.currentTarget&&setShowTeamModal(false)}>
                <div className="bg-[#0d0d18] border border-slate-700 rounded-2xl p-7 w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-extrabold text-[17px]">Create New Team</h2>
                        <button onClick={()=>setShowTeamModal(false)} className="text-slate-500 bg-transparent border-0 cursor-pointer flex hover:text-slate-300">
                            <X size={20}/>
                        </button>
                    </div>
                    <form onSubmit={handleCreateTeam} className="flex flex-col gap-3.5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Team Name *</label>
                            <input required value={teamForm.name} onChange={e=>setTeamForm(f=>({...f,name:e.target.value}))} placeholder="Engineering, Marketing, etc…" className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"/>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                            <textarea value={teamForm.description} onChange={e=>setTeamForm(f=>({...f,description:e.target.value}))} placeholder="What is this team about?" rows={3}
                                className="w-full bg-[#0f0f1a] border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-y"/>
                        </div>
                        <div className="flex gap-2.5 justify-end mt-1">
                            <button type="button" onClick={()=>setShowTeamModal(false)} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#0f0f1a] border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-900 transition-colors">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#4f46e5] hover:bg-[#4338ca] border-0 rounded-lg text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all" style={{ opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? 'Creating…' : 'Create Team'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── NEW TASK MODAL ── */}
        {showModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
                <div className="bg-[#0d0d18] border border-slate-700 rounded-2xl p-7 w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
                    {/* Modal header */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-white font-extrabold text-[17px]">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
                        <div className="flex items-center gap-2.5">
                            {editingTask && teams.find(t=>t.id===editingTask.team_id)?.created_by === user?.id && (
                                <button onClick={() => handleDeleteTask(editingTask.id)} className="bg-transparent border-0 text-red-500 text-[11px] font-bold cursor-pointer hover:opacity-85 transition-all">
                                    Delete
                                </button>
                            )}
                            <button onClick={()=>setShowModal(false)} className="text-slate-500 bg-transparent border-0 cursor-pointer flex hover:text-slate-300">
                                <X size={20}/>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                        {(() => {
                            const activeTeam = teams.find(t => t.id === (editingTask ? editingTask.team_id : parseInt(form.team_id)));
                            const isLeader = activeTeam?.created_by === user?.id;
                            const isMemberEdit = editingTask && !isLeader;

                            if (isMemberEdit) {
                                return (
                                    <div className="flex flex-col gap-4.5">
                                        <div className="bg-[#0f0f1a] p-4.5 rounded-[14px] border border-slate-700" style={{ padding: '18px' }}>
                                            <h3 className="text-white font-bold text-[15px] mb-2">{form.title}</h3>
                                            <p className="text-[#cbd5e1] text-xs leading-relaxed">{form.description || 'No description provided.'}</p>
                                            <div className="flex gap-3 mt-3.5 pt-3.5 border-t border-slate-700" style={{ marginTop: '14px', paddingTop: '14px' }}>
                                                <div>
                                                    <p className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Priority</p>
                                                    <span className="text-xs font-bold capitalize" style={{ color: PRIORITY[form.priority]||'#cbd5e1' }}>{form.priority}</span>
                                                </div>
                                                <div style={{ marginLeft: '12px' }}>
                                                    <p className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Due Date</p>
                                                    <span className="text-xs text-[#cbd5e1]">{form.due_date ? new Date(form.due_date).toLocaleDateString() : 'No date'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Update Progress</label>
                                            <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} 
                                                className="w-full h-12 bg-[#0f0f1a] border border-indigo-500 rounded-lg px-3.5 text-sm font-semibold text-slate-100 outline-none focus:ring-4 focus:ring-indigo-500/10">
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                            <>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Title *</label>
                                <input required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Task title…" className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"/>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Description</label>
                                <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description…" rows={3}
                                    className="w-full bg-[#0f0f1a] border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-y"/>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Team *</label>
                                    <select required disabled={editingTask} value={form.team_id} onChange={e=>handleTeamChange(e.target.value)} className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all disabled:opacity-50">
                                        <option value="">Select team…</option>
                                        {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Assign To</label>
                                    <select value={form.assigned_to} onChange={e=>setForm(f=>({...f,assigned_to:e.target.value}))} className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
                                        <option value="">Unassigned</option>
                                        {teamMembers.map(m=><option key={m.id} value={m.id}>{m.username}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Priority</label>
                                    <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Status</label>
                                    <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))} className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all">
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Due Date</label>
                                    <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} className="w-full h-10 bg-[#0f0f1a] border border-slate-700 rounded-lg px-3 text-xs text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"/>
                                </div>
                            </div>
                            </>
                            );
                        })()}

                        <div className="flex gap-2.5 justify-end mt-1">
                            <button type="button" onClick={()=>setShowModal(false)} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#0f0f1a] border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-900 transition-colors">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 h-[38px] px-4 bg-[#4f46e5] hover:bg-[#4338ca] border-0 rounded-lg text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/30 transition-all" style={{ opacity: submitting ? 0.6 : 1 }}>
                                {submitting ? (editingTask ? 'Updating…' : 'Creating…') : (editingTask ? 'Update Task' : 'Create Task')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* ── CUSTOM THEME-MATCHING CONFIRMATION MODAL ── */}
        {confirmAction && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-5">
                <div className="bg-[#0d0d18] border border-red-500/20 rounded-2xl p-7 w-full max-w-[400px] shadow-2xl shadow-red-500/5">
                    <h2 className="text-slate-100 font-extrabold text-base mb-3 flex items-center gap-2">
                        <AlertCircle size={18} color="#ef4444" />
                        Confirm Action
                    </h2>
                    <p className="text-slate-300 text-[13px] leading-relaxed mb-5">
                        {confirmAction.message}
                    </p>
                    <div className="flex gap-2.5 justify-end mt-1">
                        <button 
                            type="button" 
                            onClick={() => setConfirmAction(null)} 
                            className="flex items-center gap-1.5 h-[38px] px-4 bg-[#0f0f1a] border border-slate-700 rounded-lg text-slate-200 font-semibold text-xs cursor-pointer hover:bg-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmAction.onConfirm} 
                            className="flex items-center gap-1.5 h-[38px] px-4 bg-red-500 hover:bg-red-600 border-0 rounded-lg text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                            Yes, Remove
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ── PREMIUM TOAST NOTIFICATION SYSTEM ── */}
        {toast && (
            <div className={`fixed bottom-6 right-6 bg-[#0a0a14]/85 backdrop-blur-md border rounded-xl py-3 px-5 flex items-center gap-3 shadow-2xl z-[9999] transition-all animate-pulse ${toast.type === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                <div className="w-2 h-2 rounded-full shadow-[0_0_10px]" style={{
                    backgroundColor: toast.type === 'success' ? '#10b981' : '#ef4444',
                    boxShadow: `0 0 10px ${toast.type === 'success' ? '#10b981' : '#ef4444'}`
                }}/>
                <p className="color-[#f8fafc] text-[13px] font-semibold m-0">
                    {toast.message}
                </p>
            </div>
        )}
        </>
    );
}
