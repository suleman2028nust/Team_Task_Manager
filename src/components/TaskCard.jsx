import React from 'react';
import { ChevronRight, CheckCircle2, Clock, Circle } from 'lucide-react';

const STATUS = {
    completed:   { label: 'Completed',   color: '#10b981', Icon: CheckCircle2 },
    in_progress: { label: 'In Progress', color: '#3b82f6', Icon: Clock },
    pending:     { label: 'Pending',     color: '#f59e0b', Icon: Circle },
};

const PRIORITY = {
    urgent: '#ef4444', 
    high: '#f97316', 
    medium: '#f59e0b', 
    low: '#6b7280'
};

const TaskCard = ({
    task,
    currentUserId,
    cycleStatus,
    openEditModal,
    showTeamName = true
}) => {
    const s = STATUS[task.status] || STATUS.pending;
    const isMyTask = task.assigned_to === currentUserId;

    return (
        <div 
            onClick={() => openEditModal(task)}
            className="flex items-center gap-3.5 py-3 px-5.5 border-b last:border-b-0 border-[#1e1e2e] border-l-[3px] cursor-pointer hover:bg-white/[0.02] transition-all"
            style={{ borderLeftColor: s.color }}
        >
            <button 
                onClick={(e) => {
                    e.stopPropagation(); 
                    cycleStatus(task);
                }} 
                title="Click to change status"
                className="bg-transparent border-0 cursor-pointer p-0 flex shrink-0" 
                style={{ color: s.color }}
            >
                <s.Icon size={17} color={s.color}/>
            </button>

            <div className="flex-1 min-w-0">
                <p className="text-slate-200 font-semibold text-xs mb-0.5 truncate">{task.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {showTeamName && <span>{task.team_name || 'General'}</span>}
                    {showTeamName && task.due_date && <span>·</span>}
                    {task.due_date && (
                        <span>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                    {task.assignee_name && task.assignee_name !== 'Unassigned' && (
                        <>
                            <span>·</span>
                            <span style={{ 
                                color: isMyTask ? '#818cf8' : '#cbd5e1', 
                                fontWeight: isMyTask ? 700 : 500 
                            }}>
                                @{task.assignee_name}{isMyTask ? ' (you)' : ''}
                            </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                {task.priority && (
                    <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ background: PRIORITY[task.priority] || '#6b7280' }} 
                        title={`Priority: ${task.priority}`}
                    />
                )}
                <span 
                    className="text-[11px] font-bold px-2 py-0.5 rounded transition-all" 
                    style={{ backgroundColor: `${s.color}18`, color: s.color }}
                >
                    {s.label}
                </span>
                <ChevronRight size={13} className="text-slate-700"/>
            </div>
        </div>
    );
};

export default TaskCard;
export { STATUS, PRIORITY };
