import React from 'react';
import { Layout, Users, CheckSquare, LogOut } from 'lucide-react';

const Sidebar = ({ teams }) => {
    return (
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
    );
};

export default Sidebar;
