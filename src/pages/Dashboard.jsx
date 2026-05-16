import React, { useState } from 'react';
import { Layout, Users, CheckSquare, Plus, Filter, Search, LogOut, Bell, ChevronRight } from 'lucide-react';

const Dashboard = () => {
    const [teams] = useState([
        { id: 1, name: 'Marketing Strategy', color: 'bg-blue-500' },
        { id: 2, name: 'Core Product Dev', color: 'bg-purple-500' },
        { id: 3, name: 'Brand Identity', color: 'bg-emerald-500' }
    ]);

    const [tasks] = useState([
        { id: 1, title: 'Finalize Landing Page Design', team: 'Brand Identity', status: 'In Progress', priority: 'High', due: 'Today' },
        { id: 2, title: 'API Authentication Layer', team: 'Core Product Dev', status: 'Pending', priority: 'Medium', due: 'Tomorrow' },
        { id: 3, title: 'Q3 Budget Review', team: 'Marketing Strategy', status: 'Completed', priority: 'Low', due: 'Done' },
        { id: 4, title: 'Bug: Checkout Redirection', team: 'Core Product Dev', status: 'In Progress', priority: 'Urgent', due: '2h' }
    ]);

    return (
        <div className="flex h-screen bg-black text-slate-200 font-sans">
            {/* Sidebar - Deep Navy */}
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-black overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-slate-800 flex items-center justify-between px-10 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find anything..." 
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                        />
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-slate-400 hover:text-white transition relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-indigo-500 rounded-full"></span>
                        </button>
                        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                            <Plus size={18} /> New Task
                        </button>
                    </div>
                </header>

                {/* Body */}
                <div className="p-10 overflow-y-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-1 text-slate-100">Task Overview</h2>
                            <p className="text-slate-500 text-sm">You have 4 tasks in progress today.</p>
                        </div>
                        <button className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                            <Filter size={14} /> Filter View
                        </button>
                    </div>

                    {/* Task Grid/List */}
                    <div className="grid gap-4">
                        {tasks.map(task => (
                            <div key={task.id} className="group bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition duration-300 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className={`h-10 w-1 dark:rounded-full ${
                                        task.priority === 'Urgent' ? 'bg-red-500' : 
                                        task.priority === 'High' ? 'bg-orange-500' : 
                                        task.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-700'
                                    }`}></div>
                                    <div>
                                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition">{task.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                                                <Users size={12} /> {task.team}
                                            </span>
                                            <span className="text-slate-700">•</span>
                                            <span className="text-[11px] text-slate-500 font-medium italic">Due: {task.due}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-600 font-bold uppercase mb-1">Status</p>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                            task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 
                                            task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' : 
                                            'bg-slate-800 text-slate-400'
                                        }`}>
                                            {task.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <button className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
