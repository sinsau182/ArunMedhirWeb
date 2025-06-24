import React, { useEffect, useRef } from 'react';
import { DndContext } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({
  leadsByStatus,
  onDragEnd,
  statuses,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead,
  isAddingStage,
  newStageName,
  setNewStageName,
  onAddStage,
  onCancelAddStage
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAddingStage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingStage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancelAddStage();
      }
    };

    if (isAddingStage) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddingStage, onCancelAddStage]);

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {Array.isArray(statuses) && statuses.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leadsByStatus[status] || []}
            onEdit={onEdit}
            onConvert={onConvert}
            onMarkLost={onMarkLost}
            onMarkJunk={onMarkJunk}
            onAddLead={onAddLead}
          />
        ))}
        {isAddingStage && (
          <div className="flex-1 min-w-[300px] max-w-[350px] bg-gray-100 rounded-lg p-3">
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAddStage()}
                placeholder="Stage..."
                className="flex-grow p-2 border border-blue-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={onAddStage}
                className="bg-purple-700 text-white px-4 py-2 rounded-r-md hover:bg-purple-800"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press <kbd className="px-1.5 py-0.5 border bg-white rounded-sm shadow-sm">Esc</kbd> to discard
            </p>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;