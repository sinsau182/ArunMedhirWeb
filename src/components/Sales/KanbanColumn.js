import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FaPlus } from 'react-icons/fa';
import LeadCard from './LeadCard';

const statusColors = {
  'New': 'bg-gray-400 text-gray-400',
  'Contacted': 'bg-blue-500 text-blue-500',
  'Qualified': 'bg-green-500 text-green-500',
  'Quoted': 'bg-purple-500 text-purple-500',
  'Converted': 'bg-green-700 text-green-700',
  'Lost': 'bg-red-500 text-red-500',
  'Junk': 'bg-yellow-500 text-yellow-500',
};
const underlineColors = {
  'New': 'bg-gray-400',
  'Contacted': 'bg-blue-500',
  'Qualified': 'bg-green-500',
  'Quoted': 'bg-purple-500',
  'Converted': 'bg-green-700',
  'Lost': 'bg-red-500',
  'Junk': 'bg-yellow-500',
};

const KanbanColumn = ({
  status,
  stage,
  leads,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead,
  onScheduleActivity
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const showAddButton = false;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-w-[300px] max-w-[350px] bg-gray-50/50 rounded-lg transition-all duration-200 border-2
        ${isOver ? 'bg-blue-50/80 border-blue-400 shadow-lg scale-105' : 'border-transparent'}
      `}
    >
      <div className="px-4 pt-3 pb-2 bg-white shadow-md rounded-t-lg relative mb-3">
        <div className="flex items-center gap-2">
          {/* Colored dot */}
          <span className="w-3 h-3 rounded-full" style={{ background: stage?.color || '#a3a3a3' }}></span>
          <span className="text-base font-medium text-gray-700 truncate">{status}</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 cursor-default"
            title="Number of leads in this stage"
          >
            {leads.length}
          </span>
        </div>
        {/* Colored underline */}
        <div className="absolute left-0 right-0 bottom-0 h-1 rounded-b-lg" style={{ background: stage?.color || '#a3a3a3' }}></div>
      </div>
      <div className={`
        px-2 pb-2 space-y-2 min-h-[calc(100vh-200px)] overflow-y-auto transition-all duration-200
        bg-blue-50
        ${isOver ? 'bg-blue-50/50 rounded-md' : ''}
      `}>
        {leads.map((lead) => (
          <LeadCard
            key={lead.leadId}
            lead={lead}
            onEdit={onEdit}
            onConvert={onConvert}
            onMarkLost={onMarkLost}
            onMarkJunk={onMarkJunk}
            onScheduleActivity={onScheduleActivity}
          />
        ))}
        {isOver && leads.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-md bg-blue-50/30">
            <span className="text-blue-600 text-sm font-medium">Drop here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;