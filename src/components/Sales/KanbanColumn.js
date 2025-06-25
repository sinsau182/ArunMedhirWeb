import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FaPlus } from 'react-icons/fa';
import LeadCard from './LeadCard';

const KanbanColumn = ({
  status,
  leads,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead
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
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={`text-base font-medium text-gray-700 truncate`}>{status}</span>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 cursor-default"
            title="Number of leads in this stage"
          >
            {leads.length}
          </span>
        </div>
        <div className="mt-2 border-b border-gray-200" />
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