import React from 'react';

const TaskRow = ({ task }) => {
    return (
        <tr className="hover:bg-gray-50 transition">
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                    {task.status}
                </span>
            </td>
        </tr>
    );
};

export default TaskRow;
