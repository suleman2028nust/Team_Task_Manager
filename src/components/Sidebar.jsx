import React from 'react';
import { LayoutDashboard, CheckSquare, Users, LogOut, X } from 'lucide-react';

const Sidebar = ({
    user,
    teams,
    stats,
    activeNav,
    setActiveNav,
    viewTeamTasks,
    handleLogout,
    showSidebar,
    setShowSidebar,
    teamColors,
    selectedTeamView
}) => {
    return (
        <aside 
            className="sidebar-el w-64 min-w-[256px] bg-[#07070f] border-r border-[#1e1e2e] flex flex-col overflow-hidden transition-transform duration-300 md:relative md:translate-x-0" 
            style={{
                transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                position: window.innerWidth <= 768 ? 'fixed' : 'relative',
                zIndex: window.innerWidth <= 768 ? 100 : 'auto',
                height: window.innerWidth <= 768 ? '100%' : 'auto'
            }}
        >
            <div className="py-[22px] px-[18px] border-b border-[#1e1e2e] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-[35px] h-[35px] bg-[#4f46e5] rounded-[10px] flex items-center justify-center shadow-[0_0_18px_rgba(79,70,229,0.4)]">
                        <LayoutDashboard size={17} color="white"/>
                    </div>
                    <span className="text-white font-extrabold text-base tracking-tight">TaskFlow</span>
                </div>
                {window.innerWidth <= 768 && (
                    <button 
                        onClick={() => setShowSidebar(false)} 
                        className="background-none border-0 text-slate-500 cursor-pointer flex hover:text-slate-300 transition-colors"
                    >
                        <X size={20}/>
                    </button>
                )}
            </div>

            <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-2 mb-1.5">Workspace</p>
                {[
                    { id: 'tasks', label: 'Tasks', Icon: CheckSquare, badge: stats.total },
                    { id: 'teams', label: 'Teams', Icon: Users,       badge: stats.teams },
                ].map(({ id, label, Icon, badge }) => {
                    const active = activeNav === id;
                    return (
                        <button 
                            key={id} 
                            onClick={() => {
                                setActiveNav(id);
                                if (window.innerWidth <= 768) setShowSidebar(false);
                            }} 
                            className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg mb-0.5 transition-colors text-sm font-semibold border-0 cursor-pointer ${active ? 'bg-indigo-600/12 text-white' : 'bg-transparent text-slate-400 hover:text-slate-200'}`} 
                            style={{ background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent' }}
                        >
                            <div className="flex items-center gap-2.5">
                                <Icon size={15} color={active ? '#818cf8' : 'currentColor'}/>
                                {label}
                            </div>
                            <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full ${active ? 'bg-indigo-600/20 text-[#a5b4fc]' : 'bg-[#1e1e2e] text-slate-400'}`}>
                                {badge}
                            </span>
                        </button>
                    );
                })}

                <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase px-2 mt-4.5 mb-1.5" style={{ marginTop: '18px' }}>
                    My Teams
                </p>
                {teams.length === 0 ? (
                    <p className="text-xs text-slate-600 px-2">No teams yet</p>
                ) : (
                    teams.map((t, i) => {
                        const isSelected = selectedTeamView?.id === t.id && activeNav === 'teams';
                        return (
                            <button 
                                key={t.id} 
                                onClick={() => {
                                    setActiveNav('teams'); 
                                    viewTeamTasks(t);
                                    if (window.innerWidth <= 768) setShowSidebar(false);
                                }} 
                                className={`w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg font-semibold text-[12px] border-0 cursor-pointer transition-colors bg-transparent ${isSelected ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <span 
                                    className="w-1.75 h-1.75 rounded-full flex-shrink-0" 
                                    style={{ width: 7, height: 7, background: teamColors[i % teamColors.length] }}
                                />
                                <span className="truncate">{t.name}</span>
                            </button>
                        );
                    })
                )}
            </nav>

            <div className="p-2.5 border-t border-[#1e1e2e]">
                <div className="flex items-center gap-2.5 py-2 px-2.5 rounded-[11px] bg-[#0f0f1a]">
                    <div className="w-8 h-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{user?.username}</p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="text-slate-600 bg-transparent border-0 cursor-pointer flex p-0.75 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={14}/>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
