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
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const showAddButton = !['Won', 'Lost', 'Junk'].includes(status);

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-[300px] max-w-[350px] bg-gray-50/50 rounded-lg"
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">{status}</h3>
          {showAddButton && (
            <button
              onClick={() => onAddLead(status)}
              className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
              title={`Add New Opportunity to ${status}`}
            >
              <FaPlus className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="mt-1">
          <span className="text-sm text-gray-500">
            {leads.length}
          </span>
        </div>
      </div>
      <div className="px-2 pb-2 space-y-2 min-h-[calc(100vh-200px)] overflow-y-auto">
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
      </div>
    </div>
  );
};

export default KanbanColumn;