import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

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
  onCancelAddStage,
  onScheduleActivity
}) => {
  const inputRef = useRef(null);
  const [activeLead, setActiveLead] = useState(null);

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Find the lead being dragged
    const leadId = active.id;
    const allLeads = Object.values(leadsByStatus).flat();
    const draggedLead = allLeads.find(lead => lead.leadId === leadId);
    setActiveLead(draggedLead);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    onDragEnd(event);
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            onScheduleActivity={onScheduleActivity}
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
      
      <DragOverlay zIndex={9999}>
        {activeLead ? (
          <div className="transform rotate-2 scale-105 shadow-2xl">
            <LeadCard
              lead={activeLead}
              onEdit={onEdit}
              onConvert={onConvert}
              onMarkLost={onMarkLost}
              onMarkJunk={onMarkJunk}
              onScheduleActivity={onScheduleActivity}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;