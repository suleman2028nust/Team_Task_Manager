import React from 'react';
import { Users, ChevronRight } from 'lucide-react';

const TaskCard = ({ task }) => {
    return (
        <div className="group bg-slate-950 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/50 transition duration-300 flex items-center justify-between shadow-sm">
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
    );
};

export default TaskCard;
