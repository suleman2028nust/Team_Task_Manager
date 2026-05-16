import React, { useState } from 'react';
import { Plus, Filter, Search, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';

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
            <Sidebar teams={teams} />

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
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
