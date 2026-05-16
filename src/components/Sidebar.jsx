import React from 'react';
import { Layout, Users, CheckSquare, LogOut } from 'lucide-react';

const Sidebar = ({ teams }) => {
    return (
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="p-8">
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <Layout size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">TaskFlow <span className="text-indigo-500">PRO</span></h1>
                </div>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
                <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest px-4 mb-4">Overview</p>
                <button className="flex items-center justify-between w-full p-3 bg-indigo-600/10 text-indigo-400 border-r-2 border-indigo-500 rounded-lg group">
                    <div className="flex items-center gap-3 font-medium">
                        <CheckSquare size={18} /> Tasks
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-md">12</span>
                </button>
                <button className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition group">
                    <Users size={18} className="group-hover:text-indigo-400" /> Teams
                </button>
                
                <div className="pt-8">
                    <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest px-4 mb-4">My Teams</p>
                    {teams.map(team => (
                        <button key={team.id} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition text-sm">
                            <div className={`h-2 w-2 rounded-full ${team.color}`}></div>
                            {team.name}
                        </button>
                    ))}
                </div>
            </nav>

            <div className="p-6 border-t border-slate-800">
                <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl mb-4">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">U</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">User Name</p>
                        <p className="text-[10px] text-slate-500 truncate">Pro Account</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition text-sm px-2">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
