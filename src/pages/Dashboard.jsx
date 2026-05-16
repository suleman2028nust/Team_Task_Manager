import React, { useState } from 'react';
import { Layout, Users, CheckSquare, Plus, Filter, Search, LogOut } from 'lucide-react';

const Dashboard = () => {
    // dummy data for UI demonstration
    const [teams] = useState([
        { id: 1, name: 'Marketing Team' },
        { id: 2, name: 'Development Team' },
        { id: 3, name: 'Design Team' }
    ]);

    const [tasks] = useState([
        { id: 1, title: 'Fix Header Bug', team: 'Development', status: 'In Progress', assignee: 'John' },
        { id: 2, title: 'Social Media Post', team: 'Marketing', status: 'Pending', assignee: 'Sarah' },
        { id: 3, title: 'New Logo Design', team: 'Design', status: 'Completed', assignee: 'Mike' },
        { id: 4, title: 'API Integration', team: 'Development', status: 'Pending', assignee: 'John' }
    ]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* insert Sidebar */}
            <div className="w-64 bg-indigo-700 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Layout size={24} /> TaskFlow
                    </h1>
                </div>
                
                <nav className="flex-1 px-4 py-4">
                    <div className="mb-8">
                        <p className="text-xs uppercase text-indigo-300 font-semibold mb-4 px-2">Main Menu</p>
                        <button className="flex items-center gap-3 w-full p-2 bg-indigo-800 rounded-lg mb-2">
                            <CheckSquare size={20} /> Tasks
                        </button>
                        <button className="flex items-center gap-3 w-full p-2 hover:bg-indigo-600 rounded-lg transition mb-2">
                            <Users size={20} /> Teams
                        </button>
                    </div>

                    <div>
                        <p className="text-xs uppercase text-indigo-300 font-semibold mb-4 px-2">Your Teams</p>
                        {teams.map(team => (
                            <button key={team.id} className="block w-full text-left p-2 hover:bg-indigo-600 rounded-lg text-sm mb-1">
                                # {team.name}
                            </button>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-indigo-600">
                    <button className="flex items-center gap-2 text-indigo-200 hover:text-white transition">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b h-16 flex items-center justify-between px-8">
                    <div className="relative w-64">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <Search size={18} />
                        </span>
                        <input 
                            type="text" 
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Search tasks..."
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition shadow-sm">
                            <Plus size={18} /> Create Task
                        </button>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            U
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">All Tasks</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border px-3 py-1 rounded-md cursor-pointer hover:bg-gray-50">
                            <Filter size={16} /> Filter
                        </div>
                    </div>

                    {/* Task Table */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assignee</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasks.map(task => (
                                    <tr key={task.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                                        <td className="px-6 py-4 text-gray-500">{task.team}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                                                    {task.assignee[0]}
                                                </div>
                                                <span className="text-sm text-gray-600">{task.assignee}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                task.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                                task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
